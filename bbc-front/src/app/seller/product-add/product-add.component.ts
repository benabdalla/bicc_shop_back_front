import { Component, OnInit } from '@angular/core';
import { Product } from '../../interfaces/product'
import { SellerService } from 'src/app/services/seller.service';
import { Category } from 'src/app/interfaces/category';
import { CategoryService } from 'src/app/services/category.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.css']
})
export class ProductAddComponent implements OnInit {

  categories: Category[] = [];
  productImages: string[] = [];
  uploadingImages: boolean = false;
  imageUploadProgress: { [key: string]: number } = {};
  defaultSalePrice: number = 0;


  // Drag & Drop properties
  isDragOver: boolean = false;
  uploadingCount: number = 0;
  totalUploadCount: number = 0;

  // File validation constants
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(
    private sellerService: SellerService,
    private categoryService: CategoryService,
    private util: UtilService,
    private router: Router,
    private fileService: FileService
  ) { }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  saveProduct(product: Product): void {
    product.sellerId = this.sellerService.getSellerToken().id;
    product.storeName = this.sellerService.getSellerToken().storeName;
    product.status = 'Pending';

    // Convert all product images to physical URLs (remove localhost if present) and join with semicolon
    const physicalUrls = this.productImages.map(url => {
      if (url.startsWith('http://localhost:8080/')) {
        return url.replace('http://localhost:8080/', '');
      }
      return url;
    });

    product.thumbnailUrl = physicalUrls.join(';');

    this.sellerService.createProduct(product).subscribe((response) => {
      if (response != null) {
        this.util.toastify(true, "Product Added Successfully");
        this.router.navigate(['seller/products']);
      } else {
        this.util.toastify(false);
      }
    });
  }



  onMultipleImagesSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.processMultipleFiles(Array.from(files));
      // Reset the input to allow re-selection of the same files
      event.target.value = '';
    }
  }

  // Process multiple files with validation
  processMultipleFiles(files: File[]) {
    // Validate files
    const validFiles = this.validateFiles(files);
    if (validFiles.length === 0) {
      this.util.toastify(false, "No valid image files selected");
      return;
    }

    if (validFiles.length !== files.length) {
      this.util.toastify(false, `${files.length - validFiles.length} files were rejected (invalid type or too large)`);
    }

    this.uploadingImages = true;
    this.totalUploadCount = validFiles.length;
    this.uploadingCount = 0;
    const uploadPromises: Promise<any>[] = [];

    for (const file of validFiles) {
      const fileName = file.name;

      // Initialize progress for this file
      this.imageUploadProgress[fileName] = 0;

      const formData = new FormData();
      formData.append("file", file);

      const uploadPromise = new Promise((resolve, reject) => {
        this.fileService.uploadFile(formData).subscribe({
          next: (res) => {
            this.uploadingCount++;
            if (res.status == "success") {
              // Store the physical URL (remove localhost if present)
              let imageUrl = res.fileUrl;
              if (imageUrl.startsWith('http://localhost:8080/')) {
                imageUrl = imageUrl.replace('http://localhost:8080/', '');
              }
              this.productImages.push(imageUrl);
              this.imageUploadProgress[fileName] = 100;
              resolve(res);
            } else {
              console.error('Upload failed with status:', res.status);
              reject(res);
            }
          },
          error: (error) => {
            this.uploadingCount++;
            reject(error);
          }
        });
      });

      uploadPromises.push(uploadPromise);
    }

    Promise.all(uploadPromises)
      .then(() => {
        this.uploadingImages = false;
        this.uploadingCount = 0;
        this.totalUploadCount = 0;
        this.util.toastify(true, `${validFiles.length} images uploaded successfully`);
        // Clear progress tracking
        this.imageUploadProgress = {};
      })
      .catch((error) => {
        this.uploadingImages = false;
        this.uploadingCount = 0;
        this.totalUploadCount = 0;
        console.error('Upload error details:', error);
        this.util.toastify(false, "Some images failed to upload. Check console for details.");
      });
  }

  removeImage(index: number) {
    if (index >= 0 && index < this.productImages.length) {
      this.productImages.splice(index, 1);
      this.util.toastify(true, "Image removed");
    }
  }

  clearAllImages() {
    this.productImages = [];
    this.util.toastify(true, "All images cleared");
  }

  // File validation
  validateFiles(files: File[]): File[] {
    return files.filter(file => {
      // Check file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        console.warn(`File ${file.name} has invalid type: ${file.type}`);
        return false;
      }

      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        console.warn(`File ${file.name} is too large: ${file.size} bytes`);
        return false;
      }

      return true;
    });
  }

  // Drag & Drop methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processMultipleFiles(Array.from(files));
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('inputProductImages') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Get upload progress array for template
  getUploadProgressArray(): Array<{filename: string, progress: number}> {
    return Object.entries(this.imageUploadProgress).map(([filename, progress]) => ({
      filename,
      progress
    }));
  }

  // Image reordering methods
  private draggedImageIndex: number = -1;

  onImageDragStart(event: DragEvent, index: number): void {
    this.draggedImageIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onImageDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();

    if (this.draggedImageIndex !== -1 && this.draggedImageIndex !== dropIndex) {
      // Reorder the images array
      const draggedImage = this.productImages[this.draggedImageIndex];
      this.productImages.splice(this.draggedImageIndex, 1);
      this.productImages.splice(dropIndex, 0, draggedImage);

      this.util.toastify(true, "Image order updated");
    }

    this.draggedImageIndex = -1;
  }

  // Get image display URL (add localhost for display purposes)
  getImageDisplayUrl(imageUrl: string): string {
    if (!imageUrl) return '';

    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Add localhost prefix for display
    return this.fileService.host + imageUrl;
  }
}
