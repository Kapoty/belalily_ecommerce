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
			bag: {products: [], limit: 10, step: 0, shippingType: '', preOrder: {}, orderErrorMessage: ''},
			addedToBag: false, addedToBagInfo: {name: '', quantity: ''},
			customerToken: null, auth: false, customerInfo: {}, 
			consultant_code: '',
			customerWishlist: [],
			addedToWishlist: false, addedToWishlistInfo: {name: ''},
		}

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
		}
		else if (step == 2) {
			this.getCitiesList();
			this.getDistrictsList();
			this.getCustomerInfo();
			this.setState({bag: {...this.state.bag, step: step, shippingType: ''}});
		} else if (step == 3) {
			this.state.bag.coupon = '';
			this.state.bag.couponApplied = false;
			this.state.bag.preOrder = {};
			this.getPreOrder();
			this.setState({bag: {...this.state.bag, step: step}});
		}
		else this.setState({bag: {...this.state.bag, step: step}});
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
					console.log(data);
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
					}
					this.setState({bag: {...this.state.bag, preOrder: data.preOrder}});
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
			setTimeout(this.getCustomerWishlist, 5000);
			console.log(e);
		});
	}

	closeOrderErrorMessage() {
		this.setState({bag: {...this.state.bag, orderErrorMessage: ''}});
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

	render() {
		if (this.props.location.pathname == '/sacola' || this.props.location.pathname == '/' || this.props.location.pathname == '/desejos')
			this.state.lastPage = this.props.location.pathname ;

		return <React.Fragment>
			<ThemeProvider theme={theme}>
				{(this.state.blockedPopup) ? <BlockedPopup blockedClick={this.blockedClick} /> : '' }
				<CustomAppBar history={this.props.history} auth={this.state.auth} customerLogout={this.customerLogout}/>
				<div style={{display: (this.state.lastPage=='/') ? 'block' : 'none'}}>
					<Catalog history={this.props.history} categories={this.state.categories} products={this.state.products} filter={this.state.filter} openFilter={this.openFilter} filtered={this.state.filter.sizes.length != 0 || this.state.filter.order != 1} />
				</div>
				<div style={{display: (this.state.lastPage=='/desejos') ? 'block' : 'none'}}>
					<Wishlist auth={this.state.auth} favorites={this.state.wishlist} history={this.props.history} customerWishlist={this.state.customerWishlist} sizesById={this.state.sizesById} deleteProductFromCustomerWishlist={this.deleteProductFromCustomerWishlist}/>
				</div>
				<div style={{display: (this.state.lastPage=='/sacola') ? 'block' : 'none'}}>
					<Bag handleCouponSubmit={this.handleCouponSubmit} setBagShippingType={this.setBagShippingType} citiesById={this.state.citiesById} districts={this.state.districts} districtsById={this.state.districtsById} customerInfo={this.state.customerInfo} setBagStep={this.setBagStep} auth={this.state.auth} history={this.props.history} bag={this.state.bag} sizesById={this.state.sizesById} increaseProductFromBag={this.increaseProductFromBag} decreaseProductFromBag={this.decreaseProductFromBag} deleteProductFromBag={this.deleteProductFromBag}/>
				</div>
				<BottomNav lastPage={this.state.lastPage} location={this.props.location} history={this.props.history} bagQnt={this.state.bag.products.length}/>
				<InternalPage location={this.props.location} history={this.props.history} lastPage={this.state.lastPage}/>
				<LoginDialog auth={this.state.auth} customerLogin={this.customerLogin} location={this.props.location} history={this.props.history} lastPage={this.state.lastPage} citiesById={this.state.citiesById} districts={this.state.districts} secretQuestions={this.state.secretQuestions} consultant_code={this.state.consultant_code}/>
				<ProfileDialog auth={this.state.auth} customerLogin={this.customerLogout} customerToken={this.state.customerToken} getCustomerInfo={this.getCustomerInfo} location={this.props.location} history={this.props.history} lastPage={this.state.lastPage} citiesById={this.state.citiesById} districts={this.state.districts} districtsById={this.state.districtsById} secretQuestions={this.state.secretQuestions} secretQuestionsById={this.state.secretQuestionsById} customerInfo={this.state.customerInfo}/>
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