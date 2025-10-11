import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartItem } from 'src/app/interfaces/cart-item';
import { Product } from 'src/app/interfaces/product';
import { Review } from 'src/app/interfaces/review';
import { Wishlist } from 'src/app/interfaces/wishlist';
import { CustomerService } from 'src/app/services/customer.service';
import { FileService } from 'src/app/services/file.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
getDiscountPercentage() {
throw new Error('Method not implemented.');
}
  product: Product = {
    id: 0,
    title: '',
    thumbnailUrl: '',
    description: '',
    regularPrice: 0,
    salePrice: 0,
    category: '',
    stockStatus: '',
    stockCount: 0,
    sellerId: 0,
    storeName: '',
    status: ''
  };

  productId: number = 0;
  quantity: number = 1;

  isWishlisted: boolean = false;

  isProductPurchased: boolean = false;
  reviewStars: number = 3;
  reviewComment: string = '';
  reviews: Review[] = [];

  avgStar: number = 0;
  host: string = this.fileService.host;

  // Multi-image properties
  productImages: string[] = [];
  currentImageIndex: number = 0;
p: any;

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private util: UtilService,
    private router: Router,
    private fileService: FileService
  ) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.customerService.getProduct(this.productId).subscribe((response) => {
      this.product = response;
      this.initializeImages();
      this.getIsWishlisted();
    });
    this.customerService.isProductPurchased(this.productId).subscribe(res => {
      this.isProductPurchased = res;
    });
    this.getReviews();
  }

  quantityChange(decrease: boolean): void {
    if (decrease && this.quantity > 1) {
      this.quantity--;
    } else if (!decrease) {
      this.quantity++;
    }
  }





  toggleWishlist() {
    let w: Wishlist = {
      customerId: this.customerService.getCustomer().id,
      productId: this.product.id
    }
    if (this.isWishlisted) {
      this.customerService.removeFromWishlist(w).subscribe(res => {
        this.util.toastify(res, "Removed from wishlist.");
        this.getIsWishlisted();
      });
    } else {
      this.customerService.addToWishlist(w).subscribe(res => {
        this.util.toastify(res, "Added to wishlist.");
        this.getIsWishlisted();
      });
    }
  }

  getIsWishlisted() {
    let w: Wishlist = {
      customerId: this.customerService.getCustomer().id,
      productId: this.product.id
    }
    this.customerService.isWishlisted(w).subscribe(res => {
      this.isWishlisted = res;
    });
  }

  setReviewStars(star: number) {
    this.reviewStars = star;
  }

  getReviews() {
    this.customerService.getReviews(this.productId).subscribe(res => {
      this.reviews = res;

      // generating avg star
      let totalStar = 0;
      let givenStar = 0;
      for (let r of this.reviews) {
        totalStar += 5;
        givenStar += r.star;
      }
      this.avgStar = givenStar / totalStar * 100;
    });
  }

  postReview() {
    let r: Review = {
      reviewId: 0,
      customerId: this.customerService.getCustomer().id,
      customerName: this.customerService.getCustomer().name,
      productId: this.productId,
      star: this.reviewStars,
      comment: this.reviewComment
    }
    this.customerService.postReview(r).subscribe(res => {
      this.util.toastify(res, "Review Posted");
      this.getReviews();
      this.reviewStars = 3;
      this.reviewComment = '';
    });
  }

  // Multi-image methods
  getAllImages(): string[] {
    if (!this.product.thumbnailUrl) return [];
    return this.product.thumbnailUrl.split(';').filter(img => img && img.trim() !== '');
  }

  getFirstImage(product?: any): string {
    const targetProduct = product || this.product;
    if (!targetProduct || !targetProduct.thumbnailUrl) return '';
    return targetProduct.thumbnailUrl.split(';')[0] || '';
  }

  getCurrentImage(): string {
    const images = this.getAllImages();
    if (images.length === 0) return '';
    return images[this.currentImageIndex] || images[0];
  }

  setCurrentImage(index: number): void {
    const images = this.getAllImages();
    if (index >= 0 && index < images.length) {
      this.currentImageIndex = index;
    }
  }

  nextImage(): void {
    const images = this.getAllImages();
    if (images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
    }
  }

  previousImage(): void {
    const images = this.getAllImages();
    if (images.length > 1) {
      this.currentImageIndex = this.currentImageIndex > 0 ? this.currentImageIndex - 1 : images.length - 1;
    }
  }

  hasMultipleImages(): boolean {
    return this.getAllImages().length > 1;
  }

  initializeImages(): void {
    this.productImages = this.getAllImages();
    this.currentImageIndex = 0;
  }

    addToCart(product?: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Use the passed product or the component's product
    const targetProduct = product || this.product;

    // Check if we have a valid product
    if (!targetProduct || !targetProduct.id) {
      console.log("Produit non disponible");
      this.util.toastify(false, "Produit non disponible");
      return;
    }

    // Check if customer is logged in
    const customer = this.customerService.getCustomer();
    if (!customer) {
      console.log("Veuillez vous connecter pour ajouter au panier");
      this.util.toastify(false, "Veuillez vous connecter pour ajouter au panier");
      return;
    }

    let cartItem: any = {
      customerId: customer.id,
      productId: targetProduct.id,
      sellerId: targetProduct.sellerId,
      storeName: targetProduct.storeName,
      productName: targetProduct.title,
      productThumbnailUrl: this.getFirstImage(),
      productUnitPrice: targetProduct.salePrice > 0 ? targetProduct.salePrice : targetProduct.regularPrice,
      productQuantity: this.quantity, // Use the component's quantity
      subTotal: (targetProduct.salePrice > 0 ? targetProduct.salePrice : targetProduct.regularPrice) * this.quantity,
    };

    this.customerService.addToCart(cartItem).subscribe({
      next: (response) => {
        console.log("Produit ajouté au panier");
        this.util.toastify(response != null, "Produit ajouté au panier");
        this.customerService.toUpdateCart();
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout au panier:", error);
        this.util.toastify(false, "Erreur lors de l'ajout au panier");
      }
    });
  }

   buyNow(product?: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Use the passed product or the component's product
    const targetProduct = product || this.product;

    // Add to cart first
    this.addToCart(targetProduct);

    // Navigate to cart
    this.router.navigate(['cart']);
  }

}
