import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  AlertController,
  ToastController,
  LoadingController,
  NavController
} from '@ionic/angular';

import { environment } from '../../environments/environment';

import { initializeApp } from 'firebase/app';

import {
  getFirestore,
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';


const app = initializeApp(
  environment.firebaseConfig
);

const db = getFirestore(app);


@Component({
  selector: 'app-tab2',
  standalone: false,
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {

  products: any[] = [];

  filteredProducts: any[] = [];

  searchTerm: string = '';

  selectedFilter: string = 'all';

  private loading: HTMLIonLoadingElement | null = null;


  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private cdr: ChangeDetectorRef,
    private navCtrl: NavController
  ) {}


  ngOnInit() {
    this.loadProducts();
  }


  // GO TO ADD PRODUCT

  goToAddProduct() {

    this.navCtrl.navigateRoot(
      '/tabs/tab1'
    );

  }


  // TOAST

  async showToast(
    message: string,
    color: string = 'success'
  ) {

    const toast =
      await this.toastController.create({

        message: message,

        duration: 2000,

        position: 'bottom',

        color: color

      });

    await toast.present();
  }


  // LOADING

  async showLoading() {

    this.loading =
      await this.loadingController.create({

        message: 'Loading products...'

      });

    await this.loading.present();
  }


  async hideLoading() {

    if (this.loading) {

      await this.loading.dismiss();

      this.loading = null;
    }
  }


  // LOAD PRODUCTS

  async loadProducts() {

    await this.showLoading();

    const productsCol =
      collection(db, 'products');


    onSnapshot(

      productsCol,

      async (snapshot) => {

        this.products =
          snapshot.docs.map((d) => ({

            id: d.id,

            ...d.data()

          }));


        this.filterProducts();


        console.log(
          'Products loaded:',
          this.products
        );


        await this.hideLoading();


        this.cdr.detectChanges();

      },


      async (error) => {

        console.error(
          'Firestore error:',
          error
        );


        await this.hideLoading();


        await this.showToast(
          'Failed to load products.',
          'danger'
        );

      }

    );
  }


  // SEARCH

  searchProduct(event: any) {

    this.searchTerm =
      event.target.value?.toLowerCase() || '';

    this.filterProducts();
  }


  // FILTER

  segmentChanged(event: any) {

    this.selectedFilter =
      event.detail.value;

    this.filterProducts();
  }


  filterProducts() {

    let result =
      [...this.products];


    if (this.searchTerm) {

      result =
        result.filter((product) =>

          product.productName
            .toLowerCase()
            .includes(this.searchTerm)

        );
    }


    if (
      this.selectedFilter === 'available'
    ) {

      result =
        result.filter(
          (product) =>
            product.quantity > 0
        );

    }

    else if (
      this.selectedFilter === 'lowstock'
    ) {

      result =
        result.filter(
          (product) =>
            product.quantity <= 5
        );
    }


    this.filteredProducts =
      result;
  }


  // REFRESHER

  async doRefresh(event: any) {

    this.filterProducts();

    await this.showToast(
      'Product list refreshed!',
      'success'
    );

    event.target.complete();
  }


  // REFRESH BUTTON

  async refreshProductsFromButton() {

    this.filterProducts();

    await this.showToast(
      'Product list refreshed!',
      'success'
    );

    this.cdr.detectChanges();
  }


  // DELETE

  async deleteProduct(
    productId: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          'products',
          productId
        )
      );


      await this.showToast(
        'Product deleted successfully!',
        'success'
      );

    }

    catch (error) {

      console.error(
        'Error deleting product:',
        error
      );


      await this.showToast(
        'Failed to delete product.',
        'danger'
      );
    }
  }


  // UPDATE

  async updateProduct(
    product: any
  ) {

    const alertBox =
      await this.alertController.create({

        header: 'Update Product',

        inputs: [

          {
            name: 'productName',

            type: 'text',

            value:
              product.productName,

            placeholder:
              'Product Name'
          },

          {
            name: 'price',

            type: 'number',

            value:
              product.price,

            placeholder:
              'Price'
          },

          {
            name: 'quantity',

            type: 'number',

            value:
              product.quantity,

            placeholder:
              'Quantity'
          }

        ],

        buttons: [

          {
            text: 'Cancel',

            role: 'cancel'
          },

          {
            text: 'Update',

            handler:
              async (data) => {

                try {

                  await updateDoc(

                    doc(
                      db,
                      'products',
                      product.id
                    ),

                    {
                      productName:
                        data.productName,

                      price:
                        Number(
                          data.price
                        ),

                      quantity:
                        Number(
                          data.quantity
                        )
                    }

                  );


                  await this.showToast(
                    'Product updated successfully!',
                    'success'
                  );

                }

                catch (error) {

                  console.error(
                    'Error updating product:',
                    error
                  );


                  await this.showToast(
                    'Failed to update product.',
                    'danger'
                  );
                }
              }
          }

        ]
      });


    await alertBox.present();
  }

}