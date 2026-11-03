import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';

import { environment } from '../../environments/environment';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc
} from 'firebase/firestore';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);
const productsCol = collection(db, 'products');

@Component({
  selector: 'app-tab1',
  standalone: false,
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {

  newProduct = {
    productName: '',
    price: 0,
    quantity: 0
  };

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController
  ) {}

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });

    await toast.present();
  }

  async addProduct() {

    if (
      !this.newProduct.productName ||
      this.newProduct.price <= 0 ||
      this.newProduct.quantity <= 0
    ) {
      await this.showToast(
        'Please fill all fields correctly.',
        'warning'
      );
      return;
    }

    try {

      // Save product to Firestore
      await addDoc(productsCol, this.newProduct);

      await this.showToast(
        'Product added successfully!',
        'success'
      );

      // Clear the form
      this.newProduct = {
        productName: '',
        price: 0,
        quantity: 0
      };

      // Automatically go to Product List
      this.navCtrl.navigateRoot('/tabs/tab2');

    } catch (error) {

      console.error('Error adding product:', error);

      await this.showToast(
        'Failed to add product.',
        'danger'
      );

    }
  }
}