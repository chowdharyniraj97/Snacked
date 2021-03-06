const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "x6wk2ak88803",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "RCODkNS8gJa6AEk-T64u_rYY0E4csMwN_HAZcMfSKq0",
});

//variables

const cardBtn = document.querySelector(".cart-btn");
const closecartbtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//click Go
var scrollY = 0;
var distance = 10;
var speed = 1000;

function autoScrollTo(el) {
  var currentY = window.pageYOffset;
  var targetY = document.getElementById(el).offsetTop;
  var bodyHeight = document.body.offsetHeight;
  var yPos = currentY + window.innerHeight;
  var animator = setTimeout("autoScrollTo('" + el + "')", 5);
  if (yPos > bodyHeight) {
    clearTimeout(animator);
  } else {
    if (currentY < targetY - distance) {
      scrollY = currentY + distance;
      window.scroll(0, scrollY);
    } else {
      clearTimeout(animator);
    }
  }
}

// function resetScroller(el) {
//   var currentY = window.pageYOffset;
//   var targetY = document.getElementById(el).offsetTop;
//   var animator = setTimeout("resetScroller('" + el + "')", speed);
//   if (currentY > targetY) {
//     scrollY = currentY - distance;
//     window.scroll(0, scrollY);
//   } else {
//     clearTimeout(animator);
//   }
// }

function openSlideMenu() {
  document.getElementById("side-menu").style.width = "250px";
  // document.getElementById("main").style.marginLeft = "250px";
}

function closeSlideMenu() {
  document.getElementById("side-menu").style.width = "0";
  // document.getElementById("main").style.marginLeft = "0";
}
//cart

let cart = [];
let buttonDOM = [];
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({ content_type: "snacks" });

      // let result = await fetch("products.json");
      // let data = await result.json();
      let products = contentful.items;
      products = products.map((item) => {
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
    products.forEach((product) => {
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
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = " In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
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

        //display to cart
        this.addCartItem(cartItem);

        //show Cart
        // this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    console.log(cartItems);
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src="${item.image}" alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fa fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fa fa-chevron-down" data-id=${item.id}></i>
    </div>
  `;
    cartContent.appendChild(div);
    console.log(cartContent);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDom.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cardBtn.addEventListener("click", this.showCart);
    closecartbtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDom.classList.remove("showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fa fa-shopping-cart">add to cart</i>`;
  }
  getSingleButton(id) {
    return buttonDOM.find((button) => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products)); //adding data to local storage
  }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((prod) => prod.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup app
  ui.setupAPP();
  //get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagsButtons();
      ui.cartLogic();
    });
});
