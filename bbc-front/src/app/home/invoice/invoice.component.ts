import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from 'src/app/interfaces/order';
import { CustomerService } from 'src/app/services/customer.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent implements OnInit {
  customerName: string = '';
  customerEmail: string = '';
  customerAddress: string = '';

  order!: Order;

  printInvoice(): void {
    window.print();
  }

  exportPDF(): void {
    // Utilisation de html2pdf.js pour exporter la facture
    const element = document.getElementById('section-to-print');
    if (element) {
      import('html2pdf.js').then((html2pdf) => {
        html2pdf.default().from(element).save('facture.pdf');
      });
    }
  }

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.customerName = this.customerService.getCustomer().name;
    this.customerEmail = this.customerService.getCustomer().email;
    this.customerAddress = this.customerService.getCustomer().address;

    let invoiceId = this.route.snapshot.params['id'];
    this.customerService.getOrder(invoiceId).subscribe((order: any) => {
      console.log('Backend order response:', order);
      // Mapping explicite pour garantir la correspondance des champs
      this.order = {
        id: order.id ?? order.ID ?? null,
        orderDate: order.orderDate ?? order.date ?? '',
        customerId: order.customerId ?? order.customer_id ?? null,
        subTotal: order.subTotal ?? order.sub_total ?? 0,
        discount: order.discount ?? 0,
        tax: order.tax ?? 0,
        gatewayFee: order.gatewayFee ?? order.gateway_fee ?? 0,
        shippingCharge: order.shippingCharge ?? order.shipping_charge ?? 0,
        orderTotal: order.orderTotal ?? order.total ?? 0,
        shippingStreet: order.shippingStreet ?? '',
        shippingCity: order.shippingCity ?? '',
        shippingPostCode: order.shippingPostCode ?? '',
        shippingState: order.shippingState ?? '',
        shippingCountry: order.shippingCountry ?? '',
        status: order.status ?? '',
        paymentStatus: order.paymentStatus ?? '',
        paymentMethod: order.paymentMethod ?? '',
        cardNumber: order.cardNumber ?? '',
        cardCvv: order.cardCvv ?? '',
        cardHolderName: order.cardHolderName ?? '',
        cardExpiryDate: order.cardExpiryDate ?? '',
        orderDetails: Array.isArray(order.orderDetails)
          ? order.orderDetails.map((item: any) => ({
              id: item.id ?? null,
              orderId: item.orderId ?? null,
              productId: item.productId ?? null,
              sellerId: item.sellerId ?? null,
              storeName: item.storeName ?? '',
              productName: item.productName ?? item.name ?? '',
              productUnitPrice: item.productUnitPrice ?? item.price ?? 0,
              productThumbnailUrl: item.productThumbnailUrl ?? '',
              status: item.status ?? '',
              quantity: item.quantity ?? 0,
              subTotal: item.subTotal ?? item.sub_total ?? 0,
              deliveryDate: item.deliveryDate ?? '',
            }))
          : [],
      };
      console.log('Order mapped:', this.order);
    });
  }
}
