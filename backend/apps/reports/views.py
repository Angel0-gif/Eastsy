from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncHour
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from datetime import date, timedelta
from apps.users.permissions import IsAdmin
from apps.orders.models import Order, OrderItem
from apps.reservations.models import Reservation
from apps.payments.models import Payment


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdmin])
def daily_report(request):
    """
    GET /api/reports/daily/?date=YYYY-MM-DD
    Full daily report — admin only.
    """
    date_str = request.query_params.get('date')
    try:
        report_date = date.fromisoformat(date_str) if date_str else date.today()
    except ValueError:
        report_date = date.today()

    # Orders
    orders      = Order.objects.filter(created_at__date=report_date)
    paid_orders = orders.filter(status__in=['delivered', 'paid'])

    totals = paid_orders.aggregate(
        total_revenue = Sum('total'),
        total_orders  = Count('id'),
        avg_order_val = Avg('total'),
        total_covers  = Sum('items__quantity'),
    )

    # Orders by hour
    by_hour = [
        {
            'hour':  e['hour'].strftime('%I%p') if e['hour'] else '—',
            'count': e['count'],
        }
        for e in orders
            .annotate(hour=TruncHour('created_at'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
    ]

    # Top items
    top_items = [
        {
            'name':    i['menu_item__name'],
            'emoji':   i['menu_item__emoji'],
            'sold':    i['sold'],
            'revenue': int(i['revenue'] or 0),
        }
        for i in OrderItem.objects
            .filter(order__created_at__date=report_date)
            .values('menu_item__name', 'menu_item__emoji')
            .annotate(sold=Sum('quantity'), revenue=Sum('subtotal'))
            .order_by('-sold')[:10]
    ]

    # Payment breakdown
    payments       = Payment.objects.filter(created_at__date=report_date, status='success')
    total_payments = payments.count() or 1
    payment_breakdown = [
        {
            'method': label,
            'count':  (cnt := payments.filter(method=m).count()),
            'pct':    round(cnt / total_payments * 100),
        }
        for m, label in [('momo', 'Mobile Money'), ('card', 'Card'), ('table', 'Pay at Table')]
    ]

    # Reservations
    res = Reservation.objects.filter(date=report_date)
    reservations = {
        'total':     res.count(),
        'confirmed': res.filter(status='confirmed').count(),
        'cancelled': res.filter(status='cancelled').count(),
        'no_show':   res.filter(status='no_show').count(),
    }

    # Revenue vs yesterday
    yesterday         = report_date - timedelta(days=1)
    yesterday_revenue = int(
        Order.objects
            .filter(created_at__date=yesterday, status__in=['delivered', 'paid'])
            .aggregate(t=Sum('total'))['t'] or 0
    )
    today_revenue  = int(totals['total_revenue'] or 0)
    revenue_change = (
        round((today_revenue - yesterday_revenue) / yesterday_revenue * 100, 1)
        if yesterday_revenue else 0
    )

    return Response({
        'date':            report_date.isoformat(),
        'total_orders':    totals['total_orders'] or 0,
        'total_revenue':   today_revenue,
        'avg_order_value': int(totals['avg_order_val'] or 0),
        'total_covers':    int(totals['total_covers'] or 0),
        'revenue_change':  revenue_change,
        'peak_hour':       max(by_hour, key=lambda x: x['count'])['hour'] if by_hour else '—',
        'orders_by_hour':  by_hour,
        'top_items':       top_items,
        'payment_methods': payment_breakdown,
        'reservations':    reservations,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdmin])
def weekly_summary(request):
    """GET /api/reports/weekly/ — last 7 days."""
    today = date.today()
    rows  = []
    for i in range(6, -1, -1):
        d   = today - timedelta(days=i)
        agg = Order.objects.filter(
            created_at__date=d, status__in=['delivered', 'paid']
        ).aggregate(revenue=Sum('total'), orders=Count('id'))
        rows.append({
            'date':    d.isoformat(),
            'day':     d.strftime('%a'),
            'revenue': int(agg['revenue'] or 0),
            'orders':  agg['orders'] or 0,
        })
    return Response(rows)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdmin])
def dashboard_stats(request):
    """GET /api/reports/dashboard/ — quick stats for admin home."""
    today = date.today()
    return Response({
        'orders_today':       Order.objects.filter(created_at__date=today).count(),
        'revenue_today':      int(
            Order.objects
                .filter(created_at__date=today, status__in=['delivered', 'paid'])
                .aggregate(r=Sum('total'))['r'] or 0
        ),
        'reservations_today': Reservation.objects.filter(date=today).count(),
        'tables_occupied':    Reservation.objects.filter(
            date=today, status='confirmed'
        ).values('table').distinct().count(),
    })
