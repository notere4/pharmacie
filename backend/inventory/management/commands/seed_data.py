import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from inventory.models import Category, Supplier, Medicine, Stock, StockMovement

class Command(BaseCommand):
    help = 'Seeds the database with test data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Clear existing data
        StockMovement.objects.all().delete()
        Stock.objects.all().delete()
        Medicine.objects.all().delete()
        Category.objects.all().delete()
        Supplier.objects.all().delete()
        
        # Create Categories
        categories = [
            {'name': 'Antibiotiques', 'type': 'medicine', 'description': 'Médicaments antibiotiques'},
            {'name': 'Antidouleurs', 'type': 'medicine', 'description': 'Médicaments contre la douleur'},
            {'name': 'Matériel de pansement', 'type': 'material', 'description': 'Matériel pour les soins et pansements'},
            {'name': 'Vitamines', 'type': 'medicine', 'description': 'Compléments vitaminiques'},
        ]
        
        for cat_data in categories:
            Category.objects.create(**cat_data)
        
        # Create Suppliers
        suppliers = [
            {'name': 'PharmaPlus', 'contact_person': 'Jean Dupont', 'email': 'contact@pharmaplus.com', 'phone': '0612345678'},
            {'name': 'MediCare', 'contact_person': 'Marie Martin', 'email': 'contact@medicare.com', 'phone': '0623456789'},
            {'name': 'LaboPharma', 'contact_person': 'Pierre Durand', 'email': 'contact@labopharma.com', 'phone': '0634567890'},
        ]
        
        supplier_objs = [Supplier.objects.create(**supplier) for supplier in suppliers]
        
        # Get all categories
        categories = list(Category.objects.all())
        
        # Medicine data templates
        medicine_templates = [
            # Antibiotiques
            {'name': 'Amoxicilline', 'strengths': ['250mg', '500mg', '1g'], 'unit': 'boite', 'price_range': (3.50, 8.75), 'stock_range': (30, 200), 'category': 'Antibiotiques'},
            {'name': 'Azithromycine', 'strengths': ['250mg', '500mg'], 'unit': 'boite', 'price_range': (8.25, 15.50), 'stock_range': (20, 150), 'category': 'Antibiotiques'},
            {'name': 'Ciprofloxacine', 'strengths': ['250mg', '500mg', '750mg'], 'unit': 'boite', 'price_range': (5.00, 12.75), 'stock_range': (25, 180), 'category': 'Antibiotiques'},
            {'name': 'Doxycycline', 'strengths': ['50mg', '100mg'], 'unit': 'boite', 'price_range': (4.50, 10.25), 'stock_range': (20, 150), 'category': 'Antibiotiques'},
            
            # Antidouleurs
            {'name': 'Paracétamol', 'strengths': ['500mg', '1g'], 'unit': 'boite', 'price_range': (1.50, 3.75), 'stock_range': (50, 300), 'category': 'Antidouleurs'},
            {'name': 'Ibuprofène', 'strengths': ['200mg', '400mg', '600mg'], 'unit': 'boite', 'price_range': (2.25, 6.50), 'stock_range': (40, 250), 'category': 'Antidouleurs'},
            {'name': 'Tramadol', 'strengths': ['50mg', '100mg'], 'unit': 'boite', 'price_range': (5.75, 12.50), 'stock_range': (30, 150), 'category': 'Antidouleurs'},
            {'name': 'Diclofénac', 'strengths': ['25mg', '50mg', '75mg'], 'unit': 'boite', 'price_range': (3.25, 8.75), 'stock_range': (30, 180), 'category': 'Antidouleurs'},
            
            # Vitamines
            {'name': 'Vitamine C', 'strengths': ['250mg', '500mg', '1g'], 'unit': 'boite', 'price_range': (2.50, 6.75), 'stock_range': (40, 200), 'category': 'Vitamines'},
            {'name': 'Vitamine D3', 'strengths': ['400UI', '1000UI', '2000UI'], 'unit': 'flacon', 'price_range': (4.25, 10.50), 'stock_range': (30, 150), 'category': 'Vitamines'},
            {'name': 'Vitamine B Complexe', 'strengths': ['Fort', 'Extra Fort'], 'unit': 'boite', 'price_range': (3.75, 9.25), 'stock_range': (35, 180), 'category': 'Vitamines'},
            
            # Matériel de pansement
            {'name': 'Compresses stériles', 'sizes': ['5x5', '10x10', '20x20'], 'unit': 'sachet', 'price_range': (0.75, 3.50), 'stock_range': (100, 500), 'category': 'Matériel de pansement'},
            {'name': 'Seringues stériles', 'sizes': ['1ml', '3ml', '5ml', '10ml'], 'unit': 'pièce', 'price_range': (0.25, 1.25), 'stock_range': (200, 1000), 'category': 'Matériel de pansement'},
            {'name': 'Gants stériles', 'sizes': ['S', 'M', 'L', 'XL'], 'unit': 'paire', 'price_range': (0.15, 0.75), 'stock_range': (300, 1500), 'category': 'Matériel de pansement'},
            {'name': 'Pansements adhésifs', 'sizes': ['Petit', 'Moyen', 'Grand'], 'unit': 'boite', 'price_range': (2.50, 7.50), 'stock_range': (50, 300), 'category': 'Matériel de pansement'},
        ]
        
        # Generate 300 unique medicines
        medicines = []
        used_barcodes = set()
        
        while len(medicines) < 300:
            template = random.choice(medicine_templates)
            
            # Create variations based on strength or size
            if 'strengths' in template:
                strength = random.choice(template['strengths'])
                name = f"{template['name']} {strength}"
            else:
                size = random.choice(template['sizes'])
                name = f"{template['name']} {size}"
            
            # Generate unique barcode
            while True:
                barcode = str(random.randint(1000000000000, 9999999999999))
                if barcode not in used_barcodes:
                    used_barcodes.add(barcode)
                    break
            
            # Get category
            category = next(c for c in categories if c.name == template['category'])
            
            # Random supplier
            supplier = random.choice(supplier_objs)
            
            # Randomize other properties
            min_stock, max_stock = template['stock_range']
            
            medicine = {
                'name': name,
                'barcode': barcode,
                'category': category,
                'supplier': supplier,
                'unit': template['unit'],
                'min_stock_level': max(5, int(min_stock * 0.3)),
                'batch_number': f"B{random.randint(1000, 9999)}",
            }
            
            medicines.append(medicine)
            
            # Add some variations of the same medicine with different strengths/sizes
            if len(medicines) >= 300:
                break
        
        medicine_objs = [Medicine.objects.create(**med) for med in medicines]
        
        # Create Stock Movements
        for medicine in medicine_objs:
            initial_quantity = random.randint(10, 200)
            expiration_date = timezone.localdate() + timedelta(days=random.randint(100, 1000))
            Stock.objects.create(
                medicine=medicine,
                quantity=initial_quantity,
                expiration_date=expiration_date,
                location=medicine.location,
            )

            StockMovement.objects.create(
                medicine=medicine,
                type='entry',
                quantity=initial_quantity,
                reference='INIT',
                notes='Stock initial'
            )
            
            # Some random movements
            for _ in range(3):
                movement_type = random.choice(['entry', 'exit'])
                quantity = random.randint(1, 20)
                
                StockMovement.objects.create(
                    medicine=medicine,
                    type=movement_type,
                    quantity=quantity,
                    reference=f"MV-{random.randint(1000, 9999)}",
                    notes=f"Test movement - {movement_type}",
                    movement_date=timezone.now() - timedelta(days=random.randint(1, 30))
                )

                if movement_type == 'entry':
                    stock = Stock.objects.filter(medicine=medicine).order_by('expiration_date').first()
                    if stock:
                        stock.quantity += quantity
                        stock.save(update_fields=['quantity'])
                else:
                    stock = Stock.objects.filter(medicine=medicine).order_by('expiration_date').first()
                    if stock:
                        stock.quantity = max(0, stock.quantity - quantity)
                        stock.save(update_fields=['quantity'])
                        if stock.quantity == 0:
                            stock.delete()
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded the database!'))
