import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HeaderComponent } from './header/header.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home.component';
import { ProductComponent } from './product/product.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CartComponent } from './cart/cart.component';
import { SearchComponent } from './search/search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InvoiceComponent } from './invoice/invoice.component';
import { CategoryProductsComponent } from './category-products/category-products.component';
import { PublicContactUsComponent } from './contact-us/contact-us.component';
import { ChatBotComponent } from './chatbot/chatbot.component';
import { StoresComponent } from './footer/stores/stores.component';
import { EnterpriseComponent } from './footer/enterprise/enterprise.component';
import { DeliveryComponent } from './footer/delivery/delivery.component';
import { AfterSalesComponent } from './footer/after-sales/after-sales.component';
import { ProposComponent } from './footer/propos/propos.component';
import { TermsComponent } from './footer/terms/terms.component';
import { PrivacyComponent } from './footer/privacy/privacy.component';
import { ShippingComponent } from './footer/shipping/shipping.component';
import { SecurityComponent } from './footer/security/security.component';


@NgModule({
  declarations: [
    HomeComponent,
    HeaderComponent,
    ContentComponent,
    FooterComponent,
    ProductComponent,
    CheckoutComponent,
    CartComponent,
    SearchComponent,
    InvoiceComponent,
    CategoryProductsComponent,
    PublicContactUsComponent,
    ChatBotComponent,
    StoresComponent,
    EnterpriseComponent,
    DeliveryComponent,
    AfterSalesComponent,
    ProposComponent,
    TermsComponent,
    PrivacyComponent,
    ShippingComponent,
    SecurityComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class HomeModule { }
