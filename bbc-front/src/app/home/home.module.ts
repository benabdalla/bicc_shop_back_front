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
    ChatBotComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class HomeModule { }
