from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset           = Review.objects.all().select_related('user')
    serializer_class   = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    http_method_names  = ['get', 'post', 'head', 'options']

    @action(detail=False, methods=['get'])
    def summary(self, request):
        qs  = Review.objects.all()
        agg = qs.aggregate(average=Avg('rating'), total=Count('id'))
        dist = {s: qs.filter(rating=s).count() for s in range(1, 6)}
        return Response({
            'average':      round(agg['average'] or 0, 1),
            'total':        agg['total'],
            'distribution': dist,
        })
