//variables

const cardBtn = document.querySelector(".card-btn");
const closecartbtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//cart

let cart = [];
let buttonDOM = [];
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displayProducts(products) {
    let results = "";
    products.forEach(product => {
      //console.log("${product.image}");
      results += `
          <article class="product">
          <div class="img-container">
            <img
              src="${product.image}";
              alt="products"
              class="product-img"
            />

            <button class="bag-btn" data-id=${product.id}>
              <i class="fa fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        `;
    });
    productsDOM.innerHTML = results;
  }
  getBagsButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")]; //turn normal document from node to aarray using spread operator
    //console.log(buttons);
    buttonDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = " In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", event => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get prioduct from products
        let cartItem = { ...Storage.getProducts(id), amount: 1 }; //get all properties of the objact and add new attribute to it i.e amount
        //console.log(cartItem);
        //add product to cart
        cart = [...cart, cartItem];

        //save cart in local storage
        Storage.saveCart(cart);

        //set cart
        this.setCartValues(cart);
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    console.log(cartItems);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products)); //adding data to local storage
  }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(prod => prod.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  //get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagsButtons();
    });
});
