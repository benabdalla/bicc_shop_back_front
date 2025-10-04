import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { Category } from 'src/app/interfaces/category';
import { CustomerService } from 'src/app/services/customer.service';
import { FileService } from 'src/app/services/file.service';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
})
export class ContentComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  host: string = this.fileService.host;
  loading: boolean = true;
  showScrollButtons: boolean = false;

  // Category colors for visual distinction
  private readonly categoryColors: string[] = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FECA57',
    '#FF9FF3',
    '#54A0FF',
    '#5F27CD',
    '#10AC84',
    '#EE5A24',
  ];

  constructor(
    private readonly customerService: CustomerService,
    private readonly router: Router,
    private readonly fileService: FileService,
    private readonly categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.getProducts();
  }

  getCategories(): void {
    this.categoryService.getCategories().subscribe((response) => {
      this.categories = response;
      console.log('Categories loaded:', this.categories);
    });
  }

  getProducts(): void {
    this.customerService.getProducts().subscribe((response) => {
      this.products = response;
      this.loading = false;
      console.log('Products loaded:', response);
      if (Array.isArray(response)) {
        console.log(
          'Sample product categories:',
          response
            .slice(0, 3)
            .map((p) => ({ title: p.title, category: p.category }))
        );
      } else {
        console.warn('Products response is not an array:', response);
      }
    });
  }

  onCategorySelect(categoryId: number | null): void {
    if (categoryId === null) {
      // Navigate to all products page
      this.router.navigate(['/products']);
    } else {
      // Navigate to specific category products page
      this.router.navigate(['/category', categoryId]);
    }
  }

  showProduct(id: number): void {
    this.router.navigate(['product/' + id]);
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

  // Helper method to get all images from semicolon-separated thumbnailUrl
  getAllImages(product: Product): string[] {
    if (!product.thumbnailUrl) return [];
    return product.thumbnailUrl
      .split(';')
      .filter((img) => img && img.trim() !== '');
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

  // Get discount amount
  getDiscountAmount(product: Product): number {
    return product.regularPrice - product.salePrice;
  }

  // Enhanced Category Menu Methods

  // Track by function for categories
  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }

  // Get category color for visual distinction
  getCategoryColor(categoryId: number): string {
    const index = categoryId % this.categoryColors.length;
    return this.categoryColors[index];
  }

  // Get product count for a specific category
  getCategoryProductCount(categoryId: number): number {
    const categoryIdAsString = categoryId.toString();
    return this.products.filter(
      (product: Product) => product.category === categoryIdAsString
    ).length;
  }

  // Category hover effects
  onCategoryHover(categoryId: number | null): void {
    // Optional: Add hover effects or preview functionality
    console.log('Hovering over category:', categoryId);
  }

  onCategoryLeave(): void {
    // Optional: Reset hover effects
    console.log('Left category hover');
  }

  // Scroll functionality for category navigation
  scrollCategories(direction: 'left' | 'right'): void {
    const container = document.querySelector(
      '.category-scroll-container'
    ) as HTMLElement;
    if (!container) return;

    const scrollAmount = 200;
    const currentScroll = container.scrollLeft;

    if (direction === 'left') {
      container.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth',
      });
    } else {
      container.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  }
}
