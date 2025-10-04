import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { Category } from 'src/app/interfaces/category';
import { CustomerService } from 'src/app/services/customer.service';
import { FileService } from 'src/app/services/file.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-category-products',
  templateUrl: './category-products.component.html',
  styleUrls: ['./category-products.component.css'],
})
export class CategoryProductsComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  category: Category | null = null;
  categoryId: number | null = null;
  host: string = this.fileService.host;
  loading: boolean = true;

  // Price filter properties
  minPrice: number = 0;
  maxPrice: number = 1000;
  priceRange = { min: 0, max: 1000 };
  showPriceFilter: boolean = false;

  // Sort properties
  sortBy: string = 'default';
  sortOptions = [
    { value: 'default', label: 'Par défaut' },
    { value: 'price-low', label: 'Prix croissant' },
    { value: 'price-high', label: 'Prix décroissant' },
    { value: 'name', label: 'Nom : A à Z' },
    { value: 'discount', label: 'Remise la plus élevée' },
  ];

  constructor(
    private readonly customerService: CustomerService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fileService: FileService,
    private readonly categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.categoryId = params['id'] ? parseInt(params['id']) : null;
      if (this.categoryId) {
        this.loadCategoryAndProducts();
      } else {
        this.loadAllProducts();
      }
    });
  }

  loadCategoryAndProducts(): void {
    this.loading = true;

    // Load category details
    this.categoryService.getCategories().subscribe((categories) => {
      this.category =
        categories.find((cat) => cat.id === this.categoryId) || null;

      // Load products
      this.customerService.getProducts().subscribe((products) => {
        this.allProducts = products;

        if (this.categoryId) {
          const categoryIdAsString = this.categoryId.toString();
          this.filteredProducts = products.filter(
            (product) => product.category === categoryIdAsString
          );
        } else {
          this.filteredProducts = products;
        }

        this.initializePriceRange();
        this.applyPriceFilter();
        this.loading = false;
        console.log(
          `Loaded ${this.products.length} products for category:`,
          this.category?.title
        );
      });
    });
  }

  loadAllProducts(): void {
    this.loading = true;
    this.customerService.getProducts().subscribe((products) => {
      this.allProducts = products;
      this.filteredProducts = products;
      this.initializePriceRange();
      this.applyPriceFilter();
      this.loading = false;
      console.log(`Loaded ${this.products.length} products`);
    });
  }

  showProduct(id: number): void {
    this.router.navigate(['product/' + id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getDiscountPercentage(p: Product): string {
    const discountAmount = p.regularPrice - p.salePrice;
    const discountPercentage = (discountAmount / p.regularPrice) * 100;
    return '-' + discountPercentage.toFixed(0) + '%';
  }

  // Helper method to get the first image from semicolon-separated thumbnailUrl
  getFirstImage(product: Product): string {
    if (!product.thumbnailUrl) return '';
    return product.thumbnailUrl.split(';')[0] || '';
  }

  // Track by function for better performance with ngFor
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  // Handle keyboard events for accessibility
  onProductKeyPress(event: KeyboardEvent, productId: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.showProduct(productId);
    }
  }

  // Initialize price range based on available products
  initializePriceRange(): void {
    if (this.filteredProducts.length === 0) {
      this.minPrice = 0;
      this.maxPrice = 1000;
      this.priceRange = { min: 0, max: 1000 };
      return;
    }

    const prices = this.filteredProducts.map((product) => product.salePrice);
    this.minPrice = Math.floor(Math.min(...prices));
    this.maxPrice = Math.ceil(Math.max(...prices));

    // Set initial range to show all products
    this.priceRange = {
      min: this.minPrice,
      max: this.maxPrice,
    };
  }

  // Apply price filter to products
  applyPriceFilter(): void {
    this.products = this.filteredProducts.filter(
      (product) =>
        product.salePrice >= this.priceRange.min &&
        product.salePrice <= this.priceRange.max
    );
    this.applySorting();
  }

  // Handle price range change
  onPriceRangeChange(): void {
    this.applyPriceFilter();
  }

  // Toggle price filter visibility
  togglePriceFilter(): void {
    this.showPriceFilter = !this.showPriceFilter;
  }

  // Reset price filter
  resetPriceFilter(): void {
    this.priceRange = {
      min: this.minPrice,
      max: this.maxPrice,
    };
    this.applyPriceFilter();
  }

  // Get price range display text
  getPriceRangeText(): string {
    return `${this.priceRange.min} TND - ${this.priceRange.max} TND`;
  }

  // Check if price filter is active
  isPriceFilterActive(): boolean {
    return (
      this.priceRange.min !== this.minPrice ||
      this.priceRange.max !== this.maxPrice
    );
  }

  // Get filter summary text
  getFilterSummaryText(): string {
    if (this.isPriceFilterActive()) {
      return `Filtered by price: ${this.getPriceRangeText()} (${
        this.products.length
      } products)`;
    }
    return '';
  }

  // Quick filter presets
  getQuickFilterPresets(): { label: string; min: number; max: number }[] {
    const range = this.maxPrice - this.minPrice;
    return [
      {
        label: 'Budget',
        min: this.minPrice,
        max: this.minPrice + Math.round(range * 0.3),
      },
      {
        label: 'Mid-Range',
        min: this.minPrice + Math.round(range * 0.3),
        max: this.minPrice + Math.round(range * 0.7),
      },
      {
        label: 'Premium',
        min: this.minPrice + Math.round(range * 0.7),
        max: this.maxPrice,
      },
      {
        label: 'Under 50',
        min: this.minPrice,
        max: Math.min(50, this.maxPrice),
      },
      {
        label: 'Under 100',
        min: this.minPrice,
        max: Math.min(100, this.maxPrice),
      },
    ].filter(
      (preset) => preset.min < preset.max && preset.max <= this.maxPrice
    );
  }

  // Apply quick filter preset
  applyQuickFilter(preset: { min: number; max: number }): void {
    this.priceRange = { min: preset.min, max: preset.max };
    this.applyPriceFilter();
  }

  // Apply sorting to products
  applySorting(): void {
    switch (this.sortBy) {
      case 'price-low':
        this.products.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'price-high':
        this.products.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'name':
        this.products.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'discount':
        this.products.sort((a, b) => {
          const discountA =
            ((a.regularPrice - a.salePrice) / a.regularPrice) * 100;
          const discountB =
            ((b.regularPrice - b.salePrice) / b.regularPrice) * 100;
          return discountB - discountA;
        });
        break;
      default:
        // Keep original order for default
        break;
    }
  }

  // Handle sort change
  onSortChange(): void {
    this.applySorting();
  }
}
