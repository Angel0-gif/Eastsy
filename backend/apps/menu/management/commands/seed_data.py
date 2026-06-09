"""
EATSY — Seed initial data
Usage: python manage.py seed_data

Creates:
  - 1 admin account  (the only admin in the system)
  - 8 restaurant tables
  - 14 menu items
"""
from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.menu.models import MenuItem
from apps.reservations.models import Table


class Command(BaseCommand):
    help = 'Seed the EATSY database with initial data'

    def handle(self, *args, **kwargs):
        self._create_admin()
        self._create_tables()
        self._create_menu()
        self.stdout.write(self.style.SUCCESS('\n✅  Database seeded successfully!\n'))
        self.stdout.write(self.style.WARNING('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
        self.stdout.write(self.style.WARNING('  ADMIN LOGIN CREDENTIALS'))
        self.stdout.write(self.style.WARNING('  Email:    admin@eatsy.cm'))
        self.stdout.write(self.style.WARNING('  Password: Eatsy@Admin2025'))
        self.stdout.write(self.style.WARNING('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'))

    # ── ADMIN ─────────────────────────────────────────
    def _create_admin(self):
        email = 'admin@eatsy.cm'
        if not User.objects.filter(email=email).exists():
            admin = User(
                email     = email,
                full_name = 'EATSY Administrator',
                phone     = '+237 699 000 000',
                is_admin  = True,
                is_staff  = True,
                is_superuser = True,
                is_verified  = True,
            )
            admin.set_password('Eatsy@Admin2025')
            admin.save()
            self.stdout.write(f'  ✓ Admin created: {email}')
        else:
            self.stdout.write(f'  · Admin already exists: {email}')

    # ── TABLES ────────────────────────────────────────
    def _create_tables(self):
        tables = [
            {'number': 1, 'seats': 2, 'location': 'Window'},
            {'number': 2, 'seats': 4, 'location': 'Center'},
            {'number': 3, 'seats': 2, 'location': 'Window'},
            {'number': 4, 'seats': 6, 'location': 'Private Room'},
            {'number': 5, 'seats': 4, 'location': 'Terrace'},
            {'number': 6, 'seats': 2, 'location': 'Bar'},
            {'number': 7, 'seats': 8, 'location': 'Private Room'},
            {'number': 8, 'seats': 4, 'location': 'Center'},
        ]
        created = 0
        for t in tables:
            _, was_created = Table.objects.get_or_create(number=t['number'], defaults=t)
            if was_created:
                created += 1
        self.stdout.write(f'  ✓ {created} tables created ({len(tables)} total)')

    # ── MENU ──────────────────────────────────────────
    def _create_menu(self):
        items = [
            {'name': 'Ndolé & Plantains',  'description': 'Traditional Cameroonian bitterleaf stew with smoked fish', 'price': 7500,  'category': 'main',    'emoji': '🫘', 'tags': ['Cameroonian', 'Signature'], 'allergens': 'Fish',         'calories': 520},
            {'name': 'Poulet DG',           'description': 'Chicken sautéed with fried plantains & vegetables',        'price': 8500,  'category': 'main',    'emoji': '🍗', 'tags': ['Classic', 'Spicy'],         'allergens': 'None',         'calories': 640},
            {'name': 'Grilled Salmon',      'description': 'Atlantic salmon fillet with lemon butter sauce & herbs',   'price': 12500, 'category': 'main',    'emoji': '🐟', 'tags': ['Seafood', 'Healthy'],        'allergens': 'Fish',         'calories': 480},
            {'name': 'Bœuf Bourguignon',    'description': 'Slow-braised beef in red wine with herbs & carrots',       'price': 14000, 'category': 'special', 'emoji': '🥩', 'tags': ["Chef's Special"],            'allergens': 'Gluten',       'calories': 720},
            {'name': 'Beef Brochettes',     'description': 'Grilled skewers with aromatic suya spice blend',           'price': 6000,  'category': 'starter', 'emoji': '🍢', 'tags': ['Grilled', 'Spicy'],          'allergens': 'Peanuts',      'calories': 380},
            {'name': 'Avocat Farci',        'description': 'Half avocado stuffed with seasoned shrimp cocktail',       'price': 4500,  'category': 'starter', 'emoji': '🥑', 'tags': ['Light', 'Fresh'],            'allergens': 'Shellfish',    'calories': 290},
            {'name': 'Caesar Salad',        'description': 'Romaine, shaved parmesan, house croutons, Caesar dressing','price': 3500,  'category': 'starter', 'emoji': '🥗', 'tags': ['Vegetarian'],                'allergens': 'Gluten,Dairy', 'calories': 310},
            {'name': 'Accra de Morue',      'description': 'Crispy Cameroonian-style saltfish fritters',               'price': 3000,  'category': 'starter', 'emoji': '🥙', 'tags': ['Crispy', 'Local'],           'allergens': 'Fish,Gluten',  'calories': 260},
            {'name': 'Lemon Tart',          'description': 'Classic French-style citrus tart with chantilly cream',    'price': 3500,  'category': 'dessert', 'emoji': '🍋', 'tags': ['French', 'Sweet'],           'allergens': 'Gluten,Dairy', 'calories': 340},
            {'name': 'Chocolate Fondant',   'description': 'Warm dark chocolate cake with vanilla ice cream',          'price': 4000,  'category': 'dessert', 'emoji': '🍫', 'tags': ['Warm', 'Indulgent'],         'allergens': 'Gluten,Dairy', 'calories': 420},
            {'name': 'Banane Flambée',      'description': 'Caramelised banana with rum, cinnamon & coconut ice cream','price': 3000,  'category': 'dessert', 'emoji': '🍌', 'tags': ['Flambéed', 'Local'],         'allergens': 'Dairy',        'calories': 390},
            {'name': 'Mango Juice',         'description': '100% natural cold-pressed mango, no added sugar',          'price': 2000,  'category': 'drinks',  'emoji': '🥭', 'tags': ['Fresh', 'Non-alcoholic'],    'allergens': 'None',         'calories': 120},
            {'name': 'Bissap Rouge',        'description': 'Hibiscus flower drink, lightly sweetened with ginger',     'price': 1500,  'category': 'drinks',  'emoji': '🌺', 'tags': ['Local', 'Non-alcoholic'],    'allergens': 'None',         'calories': 80},
            {'name': 'Ginger Lemonade',     'description': 'Fresh ginger, lemon, honey & sparkling water',             'price': 2500,  'category': 'drinks',  'emoji': '🍹', 'tags': ['Refreshing'],                'allergens': 'None',         'calories': 95},
        ]
        created = 0
        for item in items:
            _, was_created = MenuItem.objects.get_or_create(name=item['name'], defaults=item)
            if was_created:
                created += 1
        self.stdout.write(f'  ✓ {created} menu items created ({len(items)} total)')
