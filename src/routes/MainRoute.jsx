import React from "react";
import ReactDOM from "react-dom";

import Config from "../config/Config";
import Cookies from 'universal-cookie';
const cookies = new Cookies();

import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';
import Slide from '@material-ui/core/Slide';
import Snackbar from '@material-ui/core/Snackbar';

import BottomNav from '../components/BottomNav';
import CustomAppBar from '../components/CustomAppBar';
import Catalog from '../components/Catalog';
import Bag from '../components/Bag';
import InternalPage from '../components/InternalPage';
import ProductDialog from '../components/ProductDialog';
import FilterDialog from '../components/FilterDialog';
import CookiesDialog from '../components/CookiesDialog';
import BlockedPopup from '../components/BlockedPopup';
import BagFixedDialog from '../components/BagFixedDialog';
import LoginDialog from '../components/LoginDialog';
import ProfileDialog from '../components/ProfileDialog';
import OrdersDialog from '../components/OrdersDialog';
import Wishlist from '../components/Wishlist';

import {toBRL} from '../util/Currency';

import * as ls from 'local-storage';

import queryString from 'query-string';

const theme = createTheme({
	palette: {
		/*primary: pink,
		secondary: pink,*/
		primary: {
			light: '#f47b9b',
		    main: '#f26389',
		    dark: '#f04b77',
		    contrastText: '#fff'
		}
	}
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="right" ref={ref} {...props} />;
});

export default class MainRoute extends React.Component {

	constructor(props) {
		super(props);

		this.state = {lastPage: '/', 
			cookiesDialogOpened: cookies.get('cookiesDialog') == undefined,
			blockedPopup: false, blockedPopupPass: '03213', blockedPopupPassTry: '',
			categories: [],
			products: [],
			sizes: {}, sizesById: {},
			cities: {}, citiesById: {},
			districts: [], districtsById: {},
			secretQuestions: [], secretQuestionsById: {},
			filter: {order: 1, sizes: []}, filterDialogOpened: false,
			bag: {
				products: [],
				limit: 10,
				step: 0,
				shippingType: '',
				paymentType: 0,
				preOrder: {},
				orderErrorMessage: '',
				creatingOrder: false,
				orderInfo: {},
			},
			addedToBag: false, addedToBagInfo: {name: '', quantity: ''},
			customerToken: null, auth: false, customerInfo: {}, 
			consultant_code: '',
			customerWishlist: [],
			addedToWishlist: false, addedToWishlistInfo: {name: ''},
			pagseguro: {
				scriptLoaded: false,
				sessionId: "",
				senderHash: "",
				boletoAvailable: false,
				creditCardAvailable: false,
				paymentMethods: {},
				cardInstallments: [],
				selectedInstallment: 0,
				cardToken: "",
				cardBrand: '',
			},
		}

		this.orderPayload = {};

		this.closeCookiesDialog = this.closeCookiesDialog.bind(this);
		this.blockedClick = this.blockedClick.bind(this);
		this.getCategoriesList = this.getCategoriesList.bind(this);
		this.getProductsList = this.getProductsList.bind(this);
		this.getSizesList = this.getSizesList.bind(this);
		this.getCitiesList = this.getCitiesList.bind(this);
		this.getDistrictsList = this.getDistrictsList.bind(this);
		this.getSecretQuestionsList = this.getSecretQuestionsList.bind(this);
		this.setFilter = this.setFilter.bind(this);
		this.openFilter = this.openFilter.bind(this);
		this.closeFilter = this.closeFilter.bind(this);
		this.addProductToBag = this.addProductToBag.bind(this);
		this.decreaseProductFromBag = this.decreaseProductFromBag.bind(this);
		this.increaseProductFromBag = this.increaseProductFromBag.bind(this);
		this.deleteProductFromBag = this.deleteProductFromBag.bind(this);
		this.closeAddToBag = this.closeAddToBag.bind(this);
		this.validateBagProducts = this.validateBagProducts.bind(this);
		this.updateBagProductInfo = this.updateBagProductInfo.bind(this);
		this.updateBagProductQuantity = this.updateBagProductQuantity.bind(this);
		this.loadBagProductsFromStorage = this.loadBagProductsFromStorage.bind(this);
		this.saveBagProductsToStorage = this.saveBagProductsToStorage.bind(this);
		this.getCustomerInfo = this.getCustomerInfo.bind(this);
		this.customerLogout = this.customerLogout.bind(this);
		this.customerLogin = this.customerLogin.bind(this);
		this.loadConsultantCode = this.loadConsultantCode.bind(this);
		this.getCustomerWishlist = this.getCustomerWishlist.bind(this);
		this.addProductToCustomerWishlist = this.addProductToCustomerWishlist.bind(this);
		this.deleteProductFromCustomerWishlist = this.deleteProductFromCustomerWishlist.bind(this);
		this.closeAddToWishlist = this.closeAddToWishlist.bind(this);
		this.setBagStep = this.setBagStep.bind(this);
		this.setBagShippingType = this.setBagShippingType.bind(this);
		this.getPreOrder = this.getPreOrder.bind(this);
		this.handleCouponSubmit = this.handleCouponSubmit.bind(this);
		this.closeOrderErrorMessage = this.closeOrderErrorMessage.bind(this);
		this.loadPagseguroScript = this.loadPagseguroScript.bind(this);
		this.onPagseguroSenderHashReady = this.onPagseguroSenderHashReady.bind(this);
		this.getPagseguroSessionId = this.getPagseguroSessionId.bind(this);
		this.setBagPaymentType = this.setBagPaymentType.bind(this);
		this.getPagseguroPaymentMethods = this.getPagseguroPaymentMethods.bind(this);
		this.onPagseguroPaymentMethodsSuccess = this.onPagseguroPaymentMethodsSuccess.bind(this);
		this.getPagseguroCardInstallments = this.getPagseguroCardInstallments.bind(this);
		this.onPagseguroCardInstallmentsSuccess = this.onPagseguroCardInstallmentsSuccess.bind(this);
		this.setPagseguroCardBrand = this.setPagseguroCardBrand.bind(this);
		this.getPagseguroCardBrand = this.getPagseguroCardBrand.bind(this);
		this.onPagseguroGetBrandSuccess = this.onPagseguroGetBrandSuccess.bind(this);
		this.setPagseguroSelectedInstallment = this.setPagseguroSelectedInstallment.bind(this);
		this.createOrder = this.createOrder.bind(this);
		this.setPagseguroCardToken = this.setPagseguroCardToken.bind(this);
		this.setOrderErrorMessage = this.setOrderErrorMessage.bind(this);
		this.clearBagProducts = this.clearBagProducts.bind(this);
	}

	componentDidMount() {
		this.getCategoriesList();
		this.getProductsList();
		this.getSizesList();
		this.getCitiesList();
		this.getDistrictsList();
		this.getSecretQuestionsList();
		this.loadBagProductsFromStorage();
		this.getCustomerInfo();
		this.getCustomerWishlist();
		this.loadConsultantCode();
	}

	/* get data from API */

	getCategoriesList() {
		this.setState({categories: []});
		fetch(Config.apiURL + "categories", {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(this.getCategoriesList, 5000);
			else resp.json().then((data) => {
				data.categories.sort((c1, c2) => c1.position - c2.position);
				this.setState({categories: data.categories});
			})
		})
		.catch((e) => {
			setTimeout(this.getCategoriesList, 5000);
			console.log(e);
		});
	}

	getProductsList() {
		this.setState({products: []});
		fetch(Config.apiURL + "products", {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(this.getProductsList, 5000);
			else resp.json().then((data) => {
				this.setState({products: data.products});
			})
		})
		.catch((e) => {
			setTimeout(this.getProductsList, 5000);
			console.log(e);
		});
	}

	getSizesList() {
		this.setState({sizes: {}, sizesById: {}});
		fetch(Config.apiURL + "sizes", {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(this.getSizesList, 5000);
			else resp.json().then((data) => {
				let sizesById = {}
				data.sizes.forEach((size) => sizesById[size.id] = {name: size.name})
				this.setState({sizes: data.sizes, sizesById: sizesById});
			})
		})
		.catch((e) => {
			setTimeout(this.getSizesList, 5000);
			console.log(e);
		});
	}

	getCitiesList() {
		this.setState({cities: [], citiesById: {}});
		fetch(Config.apiURL + "cities", {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(this.getCitiesList, 5000);
			else resp.json().then((data) => {
				let citiesById = {}
				data.cities.forEach((city) => citiesById[city.id] = city);
				this.setState({cities: data.cities, citiesById: citiesById});
			})
		})
		.catch((e) => {
			setTimeout(this.getCitiesList, 5000);
			console.log(e);
		});
	}

	getDistrictsList() {
		this.setState({districts: [], districtsById: {}});
		fetch(Config.apiURL + "districts", {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(this.getDistrictsList, 5000);
			else resp.json().then((data) => {
				let districtsById = {}
				data.districts.forEach((district) => districtsById[district.id] = district);
				this.setState({districts: data.districts, districtsById: districtsById});
			})
		})
		.catch((e) => {
			setTimeout(this.getDistrictsList, 5000);
			console.log(e);
		});
	}

	getSecretQuestionsList() {
		this.setState({secretQuestions: [], secretQuestionsById: {}});
		fetch(Config.apiURL + "secret-questions", {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(this.getSecretQuestionsList, 5000);
			else resp.json().then((data) => {
				let secretQuestionsById = {}
				data.secret_questions.forEach((secretQuestion) => secretQuestionsById[secretQuestion.id] = secretQuestion);
				this.setState({secretQuestions: data.secret_questions, secretQuestionsById: secretQuestionsById});
			})
		})
		.catch((e) => {
			setTimeout(this.getSecretQuestionsList, 5000);
			console.log(e);
		});
	}

	/* Authentication */

	getCustomerInfo() {
		this.state.customerToken = cookies.get('customer-token');
		if (this.state.customerToken == null) {
			this.setState({auth: false});
			return;
		}
		this.setState({customerInfo: {}});
		fetch(Config.apiURL + "customers/me/info", {
			method: "GET",
			headers: { 
				"Content-type": "application/json; charset=UTF-8",
				"x-customer-token": this.state.customerToken,
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if ('auth' in data || 'error' in data) {
					cookies.remove('customer-token');
					this.setState({auth: false, customerInfo: {}});
				}
				else
					this.setState({auth: true, customerInfo: data.customer});
			})
		})
		.catch((e) => {
			setTimeout(this.getCustomerInfo, 5000);
			console.log(e);
		});
	}

	customerLogout() {
		cookies.remove('customer-token');
		if (this.state.auth)
			this.setState({auth: false});
	}

	customerLogin(customerToken) {
		cookies.set('customer-token', customerToken);
		this.getCustomerInfo();
		this.getCustomerWishlist();
	}

	/* Favorites */

	getCustomerWishlist() {
		fetch(Config.apiURL + "customers/me/wishlist", {
			method: "GET",
			headers: { 
				"Content-type": "application/json; charset=UTF-8",
				"x-customer-token": this.state.customerToken,
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if ('auth' in data)
					return this.customerLogout();
				if (!('error' in data))
					this.setState({customerWishlist: data.wishlist});
				else
					setTimeout(this.getCustomerWishlist, 5000);
			})
		})
		.catch((e) => {
			setTimeout(this.getCustomerWishlist, 5000);
			console.log(e);
		});
	}

	addProductToCustomerWishlist(productName, productId, sizeId) {
		fetch(Config.apiURL + "customers/me/wishlist", {
			method: "POST",
			body: JSON.stringify({productId: productId, sizeId: sizeId}),
			headers: { 
				"Content-type": "application/json; charset=UTF-8",
				"x-customer-token": this.state.customerToken,
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if ('auth' in data)
					return this.customerLogout();
				if (!('error' in data)) {
					this.setState({addedToWishlist: true, addedToWishlistInfo: {name: productName}});
					this.getCustomerWishlist();
				}
			})
		})
		.catch((e) => {
			console.log(e);
		});
	}

	deleteProductFromCustomerWishlist(productId, sizeId) {
		fetch(Config.apiURL + "customers/me/wishlist", {
			method: "DELETE",
			body: JSON.stringify({productId: productId, sizeId: sizeId}),
			headers: { 
				"Content-type": "application/json; charset=UTF-8",
				"x-customer-token": this.state.customerToken,
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if ('auth' in data)
					return this.customerLogout();
				if (!('error' in data))
					this.getCustomerWishlist();
			})
		})
		.catch((e) => {
			console.log(e);
		});
	}

	closeAddToWishlist() {
		this.setState({addedToWishlist: false});
	}

	/* Cookies' Dialog */

	closeCookiesDialog() {
		cookies.set('cookiesDialog', '0', {maxAge: 7 * 86400});
		this.setState({cookiesDialogOpened: false});
	}

	/* Blocked Image System */

	blockedClick(e) {
		let x = e.clientX;
		let y = e.clientY;
		let wh = window.innerWidth;
		let he = window.innerHeight;
		if (x/wh <= 0.5) {
			if (y/he <= 0.5)
				this.state.blockedPopupPassTry += '0';
			else
				this.state.blockedPopupPassTry += '2';
		} else {
			if (y/he <= 0.5)
				this.state.blockedPopupPassTry += '1';
			else
				this.state.blockedPopupPassTry += '3';
		}
		this.state.blockedPopupPassTry = this.state.blockedPopupPassTry.substr(Math.max(this.state.blockedPopupPassTry.length-5, 0), 5);
		if (this.state.blockedPopupPassTry == this.state.blockedPopupPass)
			this.setState({blockedPopup: false});
	}

	/* Filter */

	setFilter(order, sizes) {
		this.setState({filter: {order: order, sizes: [...sizes]}, filterDialogOpened: false});
	}

	openFilter() {
		this.setState({filterDialogOpened: true});
	}

	closeFilter() {
		this.setState({filterDialogOpened: false});
	}

	/* Bag */

	addProductToBag(product, sizeId, desiredQuantity, availableQuantity) {
		let bagProduct = {
			id: product.id,
			name: product.name,
			price: product.price,
			price_in_cash: product.price_in_cash,
			desiredQuantity: desiredQuantity,
			availableQuantity: availableQuantity,
			sizeId: sizeId,
			img_number: product.img_number
		};
		let number_of_products = this.state.bag.products.length;
		let i;
		for (i=0; i<number_of_products; i++)
			if (this.state.bag.products[i].id == product.id && this.state.bag.products[i].sizeId == sizeId)
				break;
		if (i < number_of_products) {
			bagProduct.desiredQuantity += this.state.bag.products[i].desiredQuantity;
			this.state.bag.products[i] = bagProduct;
		}
		else
			this.state.bag.products.push(bagProduct);
		this.state.addedToBag = true; 
		this.state.addedToBagInfo = {name: product.name, quantity: desiredQuantity};
		this.state.bag.step = 0;
		this.saveBagProductsToStorage();
		this.forceUpdate();
	}

	clearBagProducts() {
		this.state.bag.products = [];
		this.saveBagProductsToStorage();
		this.setBagStep(0);

	}

	increaseProductFromBag(productId, sizeId, quantity) {
		let number_of_products = this.state.bag.products.length;
		for (let i=0; i<number_of_products; i++)
			if (this.state.bag.products[i].id == productId && this.state.bag.products[i].sizeId == sizeId) {
				this.state.bag.products[i].desiredQuantity += quantity;
				this.saveBagProductsToStorage();
				return this.forceUpdate();
			}
	}

	decreaseProductFromBag(productId, sizeId, quantity) {
		let number_of_products = this.state.bag.products.length;
		for (let i=0; i<number_of_products; i++)
			if (this.state.bag.products[i].id == productId && this.state.bag.products[i].sizeId == sizeId) {
				this.state.bag.products[i].desiredQuantity -= quantity;
				this.saveBagProductsToStorage();
				if (this.state.bag.products[i].desiredQuantity == 0)
					return deleteProductFromBag(productId, sizeId);
				return this.forceUpdate();
			}
	}

	deleteProductFromBag(productId, sizeId, addToCustomerWishlist, productName) {
		if (addToCustomerWishlist && this.state.auth) {
			this.addProductToCustomerWishlist(productName, productId, sizeId);
		}

		let number_of_products = this.state.bag.products.length;
		for (let i=0; i<number_of_products; i++)
			if (this.state.bag.products[i].id == productId && this.state.bag.products[i].sizeId == sizeId) {
				this.state.bag.products.splice(i, 1);
				this.saveBagProductsToStorage();
				return this.forceUpdate();
			}
	}

	validateBagProducts() {
		this.state.bag.products.forEach((product) => {
			this.updateBagProductInfo(product);
			this.updateBagProductQuantity(product);
		});
	}

	updateBagProductInfo(product) {
		fetch(Config.apiURL + "products/" + product.id, {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(() => this.updateBagProductInfo(product), 5000);
			else resp.json().then((data) => {
				let number_of_products = this.state.bag.products.length;
				for (let i=0; i<number_of_products; i++)
					if (this.state.bag.products[i].id == product.id && this.state.bag.products[i].sizeId == product.sizeId) {
						this.state.bag.products[i].name = data.product.name;
						this.state.bag.products[i].price = data.product.price;
						this.state.bag.products[i].price_in_cash = data.product.price_in_cash;
						this.state.bag.products[i].img_number = data.product.img_number;
						this.forceUpdate();
					}
			})
		})
		.catch((e) => {
			setTimeout(() => this.updateBagProductInfo(product), 5000);
			console.log(e);
		});
	}

	updateBagProductQuantity(product) {
		fetch(Config.apiURL + "products/" + product.id + "/quantity/" + product.sizeId, {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(() => this.updateBagProductQuantity(product), 5000);
			else resp.json().then((data) => {
				let number_of_products = this.state.bag.products.length;
				for (let i=0; i<number_of_products; i++)
					if (this.state.bag.products[i].id == product.id && this.state.bag.products[i].sizeId == product.sizeId) {
						this.state.bag.products[i].availableQuantity = data.quantity;
						this.forceUpdate();
					}
			})
		})
		.catch((e) => {
			setTimeout(() => this.updateBagProductQuantity(product), 5000);
			console.log(e);
		});
	}

	loadBagProductsFromStorage() {
		if (ls('bagProducts') == undefined)
			ls('bagProducts', JSON.stringify([]));
		this.state.bag.products = JSON.parse(ls('bagProducts'));
		this.validateBagProducts();
		this.forceUpdate();
	}

	saveBagProductsToStorage() {
		ls('bagProducts', JSON.stringify(this.state.bag.products));
	}

	closeAddToBag() {
		this.setState({addedToBag: false});
	}

	setBagStep(step) {
		if (step == 0) {
			this.validateBagProducts();
			this.setState({bag: {...this.state.bag, step: step}});
		} else if (step == 2) {
			this.getCitiesList();
			this.getDistrictsList();
			this.getCustomerInfo();
			this.setState({bag: {...this.state.bag, step: step, shippingType: ''}});
		} else if (step == 3) {
			this.state.bag.coupon = '';
			this.state.bag.couponApplied = false;
			this.state.bag.preOrder = {};
			this.state.bag.paymentType = 0;
			this.getPreOrder();
			this.loadPagseguroScript();
			this.setState({bag: {...this.state.bag, step: step}});
		} else {
			this.setState({bag: {...this.state.bag, step: step}});
		}
	}

	setBagShippingType(type) {
		this.setState({bag: {...this.state.bag, shippingType: type}})
	}

	handleCouponSubmit(couponCode) {
		if (this.state.bag.preOrder.coupon_applied)
			couponCode = '';
		this.getPreOrder(true, couponCode);
	}

	getPreOrder(applyCoupon, couponCode) {
		this.setState({bag: {...this.state.bag, preOrder: {}}});

		let products = [];
		this.state.bag.products.forEach((product) => products.push({
			id: product.id,
			size_id: product.sizeId,
			desiredQuantity: product.desiredQuantity
		}));

		fetch(Config.apiURL + "orders/me/pre-order", {
			method: "POST",
			body: JSON.stringify({
				products: products,
				shipping_type: this.state.bag.shippingType,
				coupon: (applyCoupon) ? couponCode : (this.state.bag.preOrder.coupon) ? this.state.bag.preOrder.coupon.code : '',
			}),
			headers: { 
				"Content-type": "application/json; charset=UTF-8",
				"x-customer-token": this.state.customerToken,
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if ('auth' in data)
					return this.customerLogout();
				if (!('error' in data)) {
					switch(data.preOrder.coupon_error) {
						case 'coupon invalid':
							this.state.bag.orderErrorMessage = 'Cupom inválido';
						break;
						case 'coupon minimum amount not reached':
							this.state.bag.orderErrorMessage = `Valor mínimo de ${toBRL(data.preOrder.coupon.minimum_amount)} não atingido`;
						break;
						case 'coupon maximum usage reached':
							this.state.bag.orderErrorMessage = `Máximo de usos atingido`;
						break;
						case 'coupon maximum units exceeded':
							this.state.bag.orderErrorMessage = `Unidades na sacola excede o limite de ${data.preOrder.coupon.max_units} unidades`;
						break;
						case 'coupon already used':
							this.state.bag.orderErrorMessage = `Cupom já utilizado`;
						break;
					}
					this.state.bag.preOrder = data.preOrder;
					if (this.state.pagseguro.sessionId != '' && this.state.pagseguro.cardBrand != '') {
						this.state.pagseguro.cardInstallments = [];
						this.state.pagseguro.selectedInstallment = 0;
						this.getPagseguroCardInstallments();
					}
					this.forceUpdate();
				} else {
					switch(data.error) {
						case 'products invalid':
							this.state.bag.orderErrorMessage = 'Os valores apresentados estão desatualizados. Por favor, tente novamente.';
							this.setBagStep(0);
						break;
						case 'shipping invalid':
							this.state.bag.orderErrorMessage = 'Método de entrega inválido.';
							this.setBagStep(2);
						break;
					}
				}
			})
		})
		.catch((e) => {
			setTimeout(() => this.getPreOrder(applyCoupon, couponCode), 5000);
			console.log(e);
		});
	}

	setOrderErrorMessage(message) {
		this.setState({bag: {...this.state.bag, orderErrorMessage: message}});
	}

	closeOrderErrorMessage() {
		this.setState({bag: {...this.state.bag, orderErrorMessage: ''}});
	}

	setBagPaymentType(type) {
		this.setState({bag: {...this.state.bag, paymentType: type}})
	}

	setPagseguroCardToken(cardToken) {
		this.state.pagseguro.cardToken = cardToken;
		this.forceUpdate();
	}

	createOrder() {
		let preOrderLoaded = !(Object.keys(this.state.bag.preOrder).length === 0);
		if (this.state.bag.creatingOrder || !preOrderLoaded)
			return;
		if (this.state.bag.paymentType == 2 &&
			(this.state.pagseguro.cardToken == '' ||
				this.state.pagseguro.senderHash == '' ||
				this.state.pagseguro.selectedInstallment == 0))
			return;
		if (this.state.bag.paymentType == 1 && this.state.pagseguro.senderHash == '')
			return;

		this.state.bag.creatingOrder = true;

		// copio o preOrder
		this.orderPayload = {};
		Object.keys(this.state.bag.preOrder).forEach((key) => this.orderPayload[key] = this.state.bag.preOrder[key]);
		this.orderPayload = JSON.parse(JSON.stringify(this.orderPayload));

		// adiciono as informações de pagamento
		this.orderPayload.paymentType = ['PIX', 'BOLETO', 'CREDIT'][this.state.bag.paymentType];

		// se for boleto
		if (this.state.bag.paymentType == 1)
			this.orderPayload.senderHash = this.state.pagseguro.senderHash;

		// se for cartão de crédito
		if (this.state.bag.paymentType == 2) {
			this.orderPayload.senderHash = this.state.pagseguro.senderHash;
			this.orderPayload.cardToken = this.state.pagseguro.cardToken;
			this.orderPayload.installmentQuantity = this.state.pagseguro.cardInstallments[this.state.pagseguro.selectedInstallment-1].quantity;
			this.orderPayload.installmentValue = this.state.pagseguro.cardInstallments[this.state.pagseguro.selectedInstallment-1].installmentAmount;
			this.orderPayload.installmentTotalAmount = this.state.pagseguro.cardInstallments[this.state.pagseguro.selectedInstallment-1].totalAmount;
		}

		console.log(JSON.stringify(this.orderPayload));

		fetch(Config.apiURL + "orders/me/create-order", {
			method: "POST",
			body: JSON.stringify(this.orderPayload),
			headers: { 
				"Content-type": "application/json; charset=UTF-8",
				"x-customer-token": this.state.customerToken,
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if ('auth' in data)
					return this.customerLogout();
				if (!('error' in data)) {
					this.state.bag.creatingOrder = false;
					this.state.bag.orderInfo = data.orderInfo;
					this.state.bag.products = [];
					this.saveBagProductsToStorage();
					this.setBagStep(4);
					// criou o pedido yay
				} else {
					switch(data.error) {
						case 'products invalid':
							this.state.bag.orderErrorMessage = 'Produtos inválidos. Por favor, tente novamente.';
							this.state.bag.creatingOrder = false;
							this.setBagStep(0);
						break;
						case 'shipping invalid':
							this.state.bag.orderErrorMessage = 'Método de entrega inválido. Por favor, tente novamente.';
							this.state.bag.creatingOrder = false;
							this.setBagStep(2);
						break;
						case 'coupon invalid':
							this.state.bag.orderErrorMessage = 'Cupom inválido. Por favor, tente novamente.';
							this.state.bag.creatingOrder = false;
							this.setBagStep(3);
						break;
						case 'values invalid':
							this.state.bag.orderErrorMessage = 'Valores incorretos. Por favor, tente novamente.';
							this.state.bag.creatingOrder = false;
							this.setBagStep(3);
						break;
						case 'payment invalid':
							this.state.bag.orderErrorMessage = 'Dados de pagamento invalidos. Por favor, tente novamente.';
							this.state.bag.creatingOrder = false;
							this.setBagStep(3);
						break;
						default:
							this.state.bag.orderErrorMessage = 'Erro inesperado: '+data.error+'. Por favor, tente novamente.';
							this.state.bag.creatingOrder = false;
							this.setBagStep(3);
					}
				}
			})
		})
		.catch((e) => {
			this.state.bag.orderErrorMessage = 'Não foi possível efetuar o pedido. Por favor, tente novamente.';
			this.state.bag.creatingOrder = false;
			this.setBagStep(3);
			console.log(e);
		});

		this.forceUpdate();
	}

	/* Consultant */

	loadConsultantCode() {
		let query = queryString.parse(this.props.location.search)
		if ('codigo' in query)
			cookies.set('consultant_code', query.codigo, {maxAge: 1 * 86400});
		let consultant_code = cookies.get('consultant_code');
		if (consultant_code !== undefined)
			this.setState({consultant_code: consultant_code});
	}

	/* Pagseguro */

	loadPagseguroScript() {
		if (document.querySelector('#pagseguro-script') != null)
			document.querySelector('#pagseguro-script').remove();
		this.setState({pagseguro: {...this.state.pagseguro,
				scriptLoaded: false,
				sessionId: "",
				senderHash: "",
				boletoAvailable: false,
				creditCardAvailable: false,
				paymentMethods: {},
				cardInstallments: [],
				selectedInstallment: 0,
			}});
		const script = document.createElement("script");
		script.setAttribute("id", "pagseguro-script");
		script.async = true;
		//script.src = "	https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js";
		script.src = "	https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js";
		script.onload = () => {
			this.setState({pagseguro: {...this.state.pagseguro, scriptLoaded: true}});
			PagSeguroDirectPayment.onSenderHashReady(this.onPagseguroSenderHashReady);
			this.getPagseguroSessionId();
		}
		document.body.appendChild(script);
	}

	onPagseguroSenderHashReady(e) {
		try {
			if (e.status == 'success') {
				this.setState({pagseguro: {...this.state.pagseguro, senderHash: e.senderHash}});
			}
		} catch (e) {
			console.log(e);
		}
	}

	getPagseguroSessionId() {
		fetch(Config.apiURL + "orders/pagseguro-session", {
			method: "GET",
		})
		.then((resp) => {
			resp.json().then((data) => {
				if (!('error' in data)) {
					PagSeguroDirectPayment.setSessionId(data.sessionId);
					this.getPagseguroPaymentMethods();
					if (this.state.pagseguro.cardBrand != '')
						this.getPagseguroCardInstallments();
					this.setState({pagseguro: {...this.state.pagseguro, sessionId: data.sessionId}});
				}
				else
					setTimeout(this.getPagseguroSessionId, 5000);
			})
		})
		.catch((e) => {
			setTimeout(this.getPagseguroSessionId, 5000);
			console.log(e);
		});
	}

	getPagseguroPaymentMethods() {
		PagSeguroDirectPayment.getPaymentMethods({
			success: this.onPagseguroPaymentMethodsSuccess,
			error: () => setTimeout(this.getPagseguroPaymentMethods, 5000),
			complete: function(response) {
			// Callback para todas chamadas.
			}
		});
	}

	onPagseguroPaymentMethodsSuccess(response) {
		if (!response.error)
			this.setState({pagseguro: {...this.state.pagseguro, paymentMethods: response.paymentMethods}})
	}

	getPagseguroCardInstallments() {
		let preOrderLoaded = !(Object.keys(this.state.bag.preOrder).length === 0);
		if (!preOrderLoaded)
			return;
		PagSeguroDirectPayment.getInstallments({
			amount: this.state.bag.preOrder.total,
			maxInstallmentNoInterest: (this.state.bag.preOrder.total >= 100) ? 3 : undefined,
			brand: this.state.pagseguro.cardBrand,
			success: this.onPagseguroCardInstallmentsSuccess,
			error: function(response) {
				// callback para chamadas que falharam.
			},
			complete: function(response){
				// Callback para todas chamadas.
			}
		});
	}

	onPagseguroCardInstallmentsSuccess(response) {
		if (this.state.pagseguro.cardBrand in response.installments)
			this.setState({pagseguro: {...this.state.pagseguro, cardInstallments: response.installments[this.state.pagseguro.cardBrand]}});
	}

	setPagseguroCardBrand(cardBrand) {
		this.state.pagseguro.cardBrand = cardBrand;
		if (cardBrand != '')
			this.getPagseguroCardInstallments();
		else {
			this.state.pagseguro.cardInstallments = [];
			this.state.pagseguro.selectedInstallment = 0;
		}
		this.forceUpdate();
	}

	getPagseguroCardBrand(number) {
		PagSeguroDirectPayment.getBrand({
			cardBin: number,
			success: this.onPagseguroGetBrandSuccess,
			error: function(response) {
				//tratamento do erro
			},
			complete: function(response) {
				//tratamento comum para todas chamadas
			}
		});
	}

	onPagseguroGetBrandSuccess(response) {
		if (this.state.pagseguro.cardBrand != response.brand.name) {
			this.setPagseguroCardBrand(response.brand.name)
		}
	}

	setPagseguroSelectedInstallment(value) {
		this.setState({pagseguro: {...this.state.pagseguro, selectedInstallment: value}})
	}

	render() {
		if (this.props.location.pathname == '/sacola' || this.props.location.pathname == '/' || this.props.location.pathname == '/desejos')
			this.state.lastPage = this.props.location.pathname ;

		return <React.Fragment>
			<ThemeProvider theme={theme}>
				{(this.state.blockedPopup) ? <BlockedPopup blockedClick={this.blockedClick} /> : '' }
				<CustomAppBar history={this.props.history} auth={this.state.auth} customerLogout={this.customerLogout} customerInfo={this.state.customerInfo}/>
				<div style={{display: (this.state.lastPage=='/') ? 'block' : 'none'}}>
					<Catalog history={this.props.history} categories={this.state.categories} products={this.state.products} filter={this.state.filter} openFilter={this.openFilter} filtered={this.state.filter.sizes.length != 0 || this.state.filter.order != 1} />
				</div>
				<div style={{display: (this.state.lastPage=='/desejos') ? 'block' : 'none'}}>
					<Wishlist auth={this.state.auth} favorites={this.state.wishlist} history={this.props.history} customerWishlist={this.state.customerWishlist} sizesById={this.state.sizesById} deleteProductFromCustomerWishlist={this.deleteProductFromCustomerWishlist}/>
				</div>
				<div style={{display: (this.state.lastPage=='/sacola') ? 'block' : 'none'}}>
					<Bag
						clearBagProducts={this.clearBagProducts}
						createOrder={this.createOrder}
						setOrderErrorMessage={this.setOrderErrorMessage}
						setPagseguroCardToken={this.setPagseguroCardToken}
						setPagseguroSelectedInstallment={this.setPagseguroSelectedInstallment}
						getPagseguroCardBrand={this.getPagseguroCardBrand}
						setPagseguroCardBrand={this.setPagseguroCardBrand}
						setBagPaymentType={this.setBagPaymentType}
						pagseguro={this.state.pagseguro}
						handleCouponSubmit={this.handleCouponSubmit}
						setBagShippingType={this.setBagShippingType}
						citiesById={this.state.citiesById}
						districts={this.state.districts}
						districtsById={this.state.districtsById}
						customerInfo={this.state.customerInfo}
						setBagStep={this.setBagStep}
						auth={this.state.auth}
						history={this.props.history}
						bag={this.state.bag}
						sizesById={this.state.sizesById}
						increaseProductFromBag={this.increaseProductFromBag}
						decreaseProductFromBag={this.decreaseProductFromBag}
						deleteProductFromBag={this.deleteProductFromBag}
					/>
				</div>
				<BottomNav lastPage={this.state.lastPage} location={this.props.location} history={this.props.history} bagQnt={this.state.bag.products.length}/>
				<InternalPage location={this.props.location} history={this.props.history} lastPage={this.state.lastPage}/>
				<LoginDialog auth={this.state.auth} customerLogin={this.customerLogin} location={this.props.location} history={this.props.history} lastPage={this.state.lastPage} citiesById={this.state.citiesById} districts={this.state.districts} secretQuestions={this.state.secretQuestions} consultant_code={this.state.consultant_code}/>
				<OrdersDialog auth={this.state.auth} customerLogout={this.customerLogout} customerToken={this.state.customerToken}  location={this.props.location} history={this.props.history} lastPage={this.state.lastPage}/>
				<ProfileDialog auth={this.state.auth} customerLogout={this.customerLogout} customerToken={this.state.customerToken} getCustomerInfo={this.getCustomerInfo} location={this.props.location} history={this.props.history} lastPage={this.state.lastPage} citiesById={this.state.citiesById} districts={this.state.districts} districtsById={this.state.districtsById} secretQuestions={this.state.secretQuestions} secretQuestionsById={this.state.secretQuestionsById} customerInfo={this.state.customerInfo}/>
				<ProductDialog auth={this.state.auth} sizesById={this.state.sizesById} addProductToBag={this.addProductToBag} addProductToCustomerWishlist={this.addProductToCustomerWishlist} location={this.props.location} history={this.props.history} lastPage={this.state.lastPage}/>
				<FilterDialog open={this.state.filterDialogOpened} filter={this.state.filter} setFilter={this.setFilter} closeFilter={this.closeFilter} sizesById={this.state.sizesById}/>
				<Snackbar
					autoHideDuration={2000} 
					open={this.state.addedToBag}
					onClose={this.closeAddToBag}
					TransitionComponent={Transition}
					message={`${this.state.addedToBagInfo.quantity}x ${this.state.addedToBagInfo.name} ${(this.state.addedToBagInfo.qnt == 1)?'foi adicionada':'foram adicionadas'} à sua sacola!`}
				/>
				<Snackbar
					autoHideDuration={2000} 
					open={this.state.addedToWishlist}
					onClose={this.closeAddToWishlist}
					TransitionComponent={Transition}
					message={`${this.state.addedToWishlistInfo.name} foi adicionada à sua lista de desejos!`}
				/>
				<Snackbar
					autoHideDuration={2000} 
					open={this.state.bag.orderErrorMessage != ''}
					onClose={this.closeOrderErrorMessage}
					TransitionComponent={Transition}
					message={this.state.bag.orderErrorMessage}
				/>
				<CookiesDialog open={this.state.cookiesDialogOpened} history={this.props.history} closeCookiesDialog={this.closeCookiesDialog}/>
			</ThemeProvider>
		</React.Fragment>
	}

}