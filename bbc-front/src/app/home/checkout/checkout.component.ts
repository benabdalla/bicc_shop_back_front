import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from 'src/app/interfaces/cart-item';
import { CollectionPoint } from 'src/app/interfaces/collection-point';
import { Order } from 'src/app/interfaces/order';
import { OrderDetails } from 'src/app/interfaces/order-details';
import { CollectionPointService } from 'src/app/services/collection-point.service';
import { CouponService } from 'src/app/services/coupon.service';
import { CustomerService } from 'src/app/services/customer.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent {
  @ViewChild('_div') _state!: ElementRef;
  @ViewChild('_dis') _city!: ElementRef;

  customerName: string = '';
  customerEmail: string = '';

  shippingStreet: string = '';
  shippingCity: string = '';
  shippingPostCode: string = '';
  shippingState: string = '';

  cartItems: CartItem[] = [];
  cartTotal: number = 0;

  couponCode: string = '';

  shippingCharge: number = 8;
  gatewayFee: number = 0;
  gatewayFeeReason: string = '';
  discount: number = 0;
  discountReason = '';

  homeDelivery: boolean = false;
  collectionPoint: boolean = false;
  collectionPoints: CollectionPoint[] = [];
  paymentMethod: string = '';
  paymentStatus: string = '';
  cardForm: boolean = false;
  cardHolderName: string = '';
  cardNumber: string = '';
  cardCvv: string = '';
  cardExpiryDate: string = '';
  orderTotal: number = 0;
  tax: number = 0;
  currentDate: string = new Date().toISOString();
  deliveryDate: string = '';

  constructor(
    private router: Router,
    private customerService: CustomerService,
    private util: UtilService,
    private couponService: CouponService,
    private collectionPointService: CollectionPointService
  ) {}

  ngOnInit(): void {
    this.customerName = this.customerService.getCustomer().name;
    this.customerEmail = this.customerService.getCustomer().email;
    this.getCartItems();
  }

  validate(): boolean {
    if (
      this.shippingStreet == '' ||
      (this.shippingCity && this.shippingCity == 'Sélectionner une ville') ||
      this.shippingCity == '' ||
      this.shippingPostCode == '' ||
      (this.shippingState && this.shippingState == 'Sélectionner une région') ||
      this.shippingState == '' ||
      this.paymentMethod == '' ||
      (this.cardForm &&
        (this.cardHolderName == '' ||
          this.cardNumber == '' ||
          this.cardCvv == '' ||
          this.cardExpiryDate == ''))
    ) {
      return false;
    }
    return true;
  }

  placeOrder() {
    if (this.validate()) {
      const orderDetails: OrderDetails[] = [];
      for (let item of this.cartItems) {
        let orderDetail: OrderDetails = {
          productId: item.productId,
          sellerId: item.sellerId,
          storeName: item.storeName,
          productName: item.productName,
          productUnitPrice: item.productUnitPrice,
          productThumbnailUrl: item.productThumbnailUrl,
          status: 'Pending',
          quantity: item.productQuantity,
          subTotal: item.subTotal,
          deliveryDate: this.deliveryDate,
        };
        orderDetails.push(orderDetail);
      }

      const order: Order = {
        orderDate: this.currentDate,
        orderTotal: this.orderTotal,
        customerId: this.customerService.getCustomer().id,
        discount: this.discount,
        shippingCharge: this.shippingCharge,
        tax: this.tax,
        shippingStreet: this.shippingStreet,
        shippingCity: this.shippingCity,
        shippingPostCode: this.shippingPostCode,
        shippingState: this.shippingState,
        shippingCountry: 'Bangladesh',
        status: 'Processing',
        subTotal: this.cartTotal,
        paymentStatus: this.paymentStatus,
        paymentMethod: this.paymentMethod,
        cardNumber: this.cardNumber,
        cardCvv: this.cardCvv,
        cardHolderName: this.cardHolderName,
        cardExpiryDate: this.cardExpiryDate,
        orderDetails: orderDetails,
        gatewayFee: this.gatewayFee,
      };

      this.customerService.placeOrder(order).subscribe((order) => {
        if (order != null) {
          this.util.toastify(true, 'Order Placed');
          this.router.navigate(['../invoice', order.id]);
          this.customerService.clearCart();
          this.customerService.toUpdateCart();
        } else {
          this.util.toastify(false);
        }
      });
    } else {
      this.util.toastify(false, '', 'Check all required fields');
    }
  }

  applyCoupon() {
    this.couponService.checkCoupon(this.couponCode).subscribe((coupon) => {
      if (coupon != null) {
        if (coupon.couponType == 'Flat') {
          this.discount = coupon.couponValue;
          this.discountReason =
            '(' + coupon.couponType + ' ' + coupon.couponValue + ')';
        } else {
          this.discount = this.cartTotal * (coupon.couponValue / 100);
          this.discountReason = '(' + coupon.couponValue + '%)';
        }
        this.calcOrderTotal();
        this.util.toastify(true, 'Coupon Applied');
      } else {
        this.util.toastify(false, '', 'Coupon is not valid');
      }
    });
  }

  calcOrderTotal() {
    this.orderTotal =
      this.cartTotal +
      this.shippingCharge +
      this.gatewayFee -
      this.discount +
      this.tax;
  }

  getCartItems() {
    this.customerService.getCartItems().subscribe((response) => {
      if (response.length < 1) {
        this.router.navigate(['']);
      }
      this.cartItems = response;
      this.cartTotal = 0;
      for (let item of this.cartItems) {
        this.cartTotal += item.subTotal;
      }
      this.tax = this.cartTotal * 0.1;
      this.calcOrderTotal();
    });
  }

  onPaymentMethod(method: any) {
    this.cardForm = false;
    this.paymentMethod = method;

    if (method == 'COD') {
      this.gatewayFee = 0;
      this.gatewayFeeReason = 'COD (Flat 50)';
      this.paymentStatus = 'Unpaid';
    }

    if (method == 'Card') {
      this.gatewayFee = this.cartTotal * 0.05;
      this.gatewayFeeReason = 'Card (5%)';
      this.cardForm = true;
      this.paymentStatus = 'Paid';
    }
    if (method == 'bKash') {
      this.gatewayFee = 0;
      this.paymentStatus = 'Paid';
    }
    this.calcOrderTotal();
  }

  onDistrictSelect(id: any) {
    if (id == 1 || id == 10) {
      this.shippingCharge = 8;
    } else {
      this.shippingCharge = 8;
    }
    this.calcOrderTotal();
    this.shippingCity =
      this._city.nativeElement.options[
        this._city.nativeElement.selectedIndex
      ].text;
    this.getCollectionPoint();
  }

  onDivisionSelect(id: any) {
    this.shippingCharge = 8;
    this.selectedDistricts = [];
    for (let dis of this.districts) {
      if (dis.division_id == id) {
        this.selectedDistricts.push(dis);
      }
    }
    this.shippingState =
      this._state.nativeElement.options[
        this._state.nativeElement.selectedIndex
      ].text;
  }

  onShippingSelected(type: string) {
    this.homeDelivery = false;
    this.collectionPoint = false;

    if (type == 'h') {
      this.homeDelivery = true;
    }

    if (type == 'c') {
      this.collectionPoint = true;
      this.getCollectionPoint();
    }
  }

  getCollectionPoint() {
    this.collectionPointService.readAll()
      .subscribe((res) => {
        this.collectionPoints = res;
      });
  }

  onCollectionSelect(pos: any) {
    console.log(pos);

    this.shippingPostCode = ' ';
    this.shippingStreet = '';
    if (pos == -1) {
      this.shippingCharge = 8;
      this.calcOrderTotal();
    } else {
      this.shippingCharge = 8;
      this.calcOrderTotal();
      this.shippingStreet = this.collectionPoints[pos].address;
    }
  }

  selectedDistricts: any = [];

  divisions: any[] = [
    { id: '1', name: 'Tunis' },
    { id: '2', name: 'Ariana' },
    { id: '3', name: 'Ben Arous' },
    { id: '4', name: 'Manouba' },
    { id: '5', name: 'Sousse' },
    { id: '6', name: 'Sfax' },
    { id: '7', name: 'Nabeul' },
    { id: '8', name: 'Bizerte' },
    { id: '9', name: 'Gabès' },
    { id: '10', name: 'Kairouan' },
    { id: '11', name: 'Tozeur' },
    { id: '12', name: 'Médenine' },
    { id: '13', name: 'Gafsa' },
    { id: '14', name: 'Zaghouan' },
    { id: '15', name: 'Siliana' },
    { id: '16', name: 'Jendouba' },
    { id: '17', name: 'Kasserine' },
    { id: '18', name: 'Kef' },
    { id: '19', name: 'Mahdia' },
    { id: '20', name: 'Monastir' },
    { id: '21', name: 'Sidi Bouzid' },
    { id: '22', name: 'Tataouine' },
    { id: '23', name: 'Béja' },
    { id: '24', name: 'Djerba' },
  ];

  districts: any[] = [
    { id: '1', division_id: '1', name: 'Tunis' },
    { id: '2', division_id: '1', name: 'La Marsa' },
    { id: '3', division_id: '1', name: 'Le Bardo' },
    { id: '4', division_id: '2', name: 'Ariana' },
    { id: '5', division_id: '2', name: 'La Soukra' },
    { id: '6', division_id: '3', name: 'Ben Arous' },
    { id: '7', division_id: '3', name: 'Ezzahra' },
    { id: '8', division_id: '4', name: 'Manouba' },
    { id: '9', division_id: '4', name: 'Oued Ellil' },
    { id: '10', division_id: '5', name: 'Sousse' },
    { id: '11', division_id: '5', name: 'Hammam Sousse' },
    { id: '12', division_id: '6', name: 'Sfax' },
    { id: '13', division_id: '6', name: 'Mahres' },
    { id: '14', division_id: '7', name: 'Nabeul' },
    { id: '15', division_id: '7', name: 'Hammamet' },
    { id: '16', division_id: '8', name: 'Bizerte' },
    { id: '17', division_id: '8', name: 'Menzel Bourguiba' },
    { id: '18', division_id: '9', name: 'Gabès' },
    { id: '19', division_id: '9', name: 'Mareth' },
    { id: '20', division_id: '10', name: 'Kairouan' },
    { id: '21', division_id: '10', name: 'Haffouz' },
    { id: '22', division_id: '11', name: 'Tozeur' },
    { id: '23', division_id: '12', name: 'Médenine' },
    { id: '24', division_id: '13', name: 'Gafsa' },
    { id: '25', division_id: '14', name: 'Zaghouan' },
    { id: '26', division_id: '15', name: 'Siliana' },
    { id: '27', division_id: '16', name: 'Jendouba' },
    { id: '28', division_id: '17', name: 'Kasserine' },
    { id: '29', division_id: '18', name: 'Kef' },
    { id: '30', division_id: '19', name: 'Mahdia' },
    { id: '31', division_id: '20', name: 'Monastir' },
    { id: '32', division_id: '21', name: 'Sidi Bouzid' },
    { id: '33', division_id: '22', name: 'Tataouine' },
    { id: '34', division_id: '23', name: 'Béja' },
    { id: '35', division_id: '24', name: 'Djerba' },
  ];
}
