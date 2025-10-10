import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { Category } from 'src/app/interfaces/category';
import { CustomerService } from 'src/app/services/customer.service';
import { FileService } from 'src/app/services/file.service';
import { CategoryService } from 'src/app/services/category.service';
import { CartItem } from 'src/app/interfaces/cart-item';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  categories: Category[] = [];
  host: string = this.fileService.host;
  loading: boolean = true;
  showScrollButtons: boolean = false;

  // Carousel properties
  currentSlideIndex: number = 0;
  canScrollPrev: boolean = false;
  canScrollNext: boolean = true;
  itemWidth: number = 280;
  gap: number = 24;
  itemsPerView: number = 4;

  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef;
  @ViewChild('categoryContainer', { static: false }) categoryContainer!: ElementRef;

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
    private readonly categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.getProducts();
    this.updateCarouselNavigation();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCarousel();
    }, 100);
  }

  // Initialize carousel
  initializeCarousel(): void {
    this.calculateItemsPerView();
    this.updateCarouselNavigation();
    this.updateCarouselPosition();
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

  // Calculate items per view based on container width
  calculateItemsPerView(): void {
    if (this.carouselTrack?.nativeElement) {
      const containerWidth = this.carouselTrack.nativeElement.offsetWidth;
      const itemWidthWithGap = this.itemWidth + this.gap;
      this.itemsPerView = Math.floor(containerWidth / itemWidthWithGap);
    } else {
      // Fallback based on window width
      const width = window.innerWidth;
      if (width < 576) this.itemsPerView = 1;
      else if (width < 768) this.itemsPerView = 2;
      else if (width < 1200) this.itemsPerView = 3;
      else if (width < 1400) this.itemsPerView = 4;
      else this.itemsPerView = 5;
    }
  }

  // Get first 10 products for carousel
  getCarouselProducts(): Product[] {
    return this.products.slice(0, 10);
  }

  // Get carousel indicators
  getCarouselIndicators(): number[] {
    const carouselProducts = this.getCarouselProducts();
    const totalSlides = Math.max(1, Math.ceil(carouselProducts.length / this.itemsPerView));
    return Array(totalSlides).fill(0);
  }

  // Scroll carousel
  scrollProductsCarousel(direction: 'prev' | 'next'): void {
    const totalProducts = this.getCarouselProducts().length;
    const maxSlideIndex = Math.max(0, Math.ceil(totalProducts / this.itemsPerView) - 1);

    if (direction === 'next' && this.currentSlideIndex < maxSlideIndex) {
      this.currentSlideIndex++;
    } else if (direction === 'prev' && this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }

    this.updateCarouselPosition();
    this.updateCarouselNavigation();
  }

  // Go to specific slide
  goToSlide(index: number): void {
    const totalSlides = this.getCarouselIndicators().length;
    if (index >= 0 && index < totalSlides) {
      this.currentSlideIndex = index;
      this.updateCarouselPosition();
      this.updateCarouselNavigation();
    }
  }

  // Update carousel position
  private updateCarouselPosition(): void {
    if (this.carouselTrack?.nativeElement) {
      const itemWidthWithGap = this.itemWidth + this.gap;
      const translateX = -(this.currentSlideIndex * this.itemsPerView * itemWidthWithGap);

      const slideElement = this.carouselTrack.nativeElement.querySelector('.products-carousel-slide');
      if (slideElement) {
        slideElement.style.transform = `translateX(${translateX}px)`;
      }
    }
  }

  // Update navigation buttons state
  private updateCarouselNavigation(): void {
    const totalSlides = this.getCarouselIndicators().length;
    this.canScrollPrev = this.currentSlideIndex > 0;
    this.canScrollNext = this.currentSlideIndex < totalSlides - 1;
  }

  // Show all products (navigate to products page)
  showAllProducts(): void {
    // Implement navigation to all products page
    console.log('Navigate to all products');
  }

  // Handle window resize
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.currentSlideIndex = 0;
    setTimeout(() => {
      this.calculateItemsPerView();
      this.updateCarouselNavigation();
      this.updateCarouselPosition();
    }, 100);
  }

  addToCart(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Check if customer is logged in
    const customer = this.customerService.getCustomer();
    if (!customer) {
      console.log("Veuillez vous connecter pour ajouter au panier");
      // Replace with your notification method
      // this.util.toastify(false, "Veuillez vous connecter pour ajouter au panier");
      return;
    }

    let cartItem: any = {
      customerId: customer.id,
      productId: product.id,
      sellerId: product.sellerId,
      storeName: product.storeName,
      productName: product.title,
      productThumbnailUrl: this.getFirstImage(product),
      productUnitPrice: product.salePrice > 0 ? product.salePrice : product.regularPrice,
      productQuantity: 1,
      subTotal: (product.salePrice > 0 ? product.salePrice : product.regularPrice) * 1,
    };

    this.customerService.addToCart(cartItem).subscribe((response) => {
      console.log("Produit ajouté au panier");
      // Replace with your notification method
      // this.util.toastify(response != null, "Produit ajouté au panier");
      this.customerService.toUpdateCart();
    });
  }

  addToWishlist(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Check if customer is logged in
    const customer = this.customerService.getCustomer();
    if (!customer) {
      console.log("Veuillez vous connecter pour ajouter aux favoris");
      return;
    }

    // Simple wishlist implementation using localStorage
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

    // Check if item already exists
    const existingItem = wishlist.find((item: any) => item.id === product.id);

    if (!existingItem) {
      const wishlistItem = {
        id: product.id,
        title: product.title,
        price: product.salePrice > 0 ? product.salePrice : product.regularPrice,
        image: this.getFirstImage(product),
        dateAdded: new Date().toISOString()
      };

      wishlist.push(wishlistItem);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      console.log("Produit ajouté aux favoris");
    } else {
      console.log("Produit déjà dans les favoris");
    }
  }

  buyNow(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.addToCart(product);
    this.router.navigate(['cart']);
  }

  // Mock data generators (replace with your actual data)
  private generateMockProducts(): any[] {
    const products = [];
    for (let i = 1; i <= 15; i++) {
      products.push({
        id: i,
        title: `Produit ${i}`,
        regularPrice: 100 + (i * 10),
        salePrice: i % 3 === 0 ? 80 + (i * 8) : 0,
        images: [`/api/images/product${i}.jpg`],
        category: Math.floor(Math.random() * 5) + 1
      });
    }
    return products;
  }


  // Calculate items per view based on container width
  calculateItemsPerView1(): void {
    if (this.carouselTrack?.nativeElement) {
      const containerWidth = this.carouselTrack.nativeElement.offsetWidth;
      const itemWidthWithGap = this.itemWidth + this.gap;
      this.itemsPerView = Math.floor(containerWidth / itemWidthWithGap);
    } else {
      // Fallback based on window width
      const width = window.innerWidth;
      if (width < 576) this.itemsPerView = 1;
      else if (width < 768) this.itemsPerView = 2;
      else if (width < 1200) this.itemsPerView = 3;
      else if (width < 1400) this.itemsPerView = 4;
      else this.itemsPerView = 5;
    }
  }

  // Get first 10 products for carousel
  getCarouselProducts1(): Product[] {
    return this.products.slice(0, 10);
  }

  // Get carousel indicators
  getCarouselIndicators1(): number[] {
    const carouselProducts = this.getCarouselProducts1();
    const totalSlides = Math.max(1, Math.ceil(carouselProducts.length / this.itemsPerView));
    return Array(totalSlides).fill(0);
  }

  // Scroll carousel
  scrollProductsCarousel1(direction: 'prev' | 'next'): void {
    const totalProducts = this.getCarouselProducts().length;
    const maxSlideIndex = Math.max(0, Math.ceil(totalProducts / this.itemsPerView) - 1);

    if (direction === 'next' && this.currentSlideIndex < maxSlideIndex) {
      this.currentSlideIndex++;
    } else if (direction === 'prev' && this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }

    this.updateCarouselPosition();
    this.updateCarouselNavigation();
  }



}
