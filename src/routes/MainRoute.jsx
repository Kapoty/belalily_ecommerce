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

import * as ls from 'local-storage';

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
			sizes: {},
			filter: {order: 1, sizes: []}, filterDialogOpened: false,
			bag: {products: [
					{
						id: 1,
						name: 'T-Shirt Exemplos',
						price: 45,
						desiredQuantity: 3,
						availableQuantity: 0,
						sizeId: 2,
						img_number: 0
					},
					{
						id: 1,
						name: 'T-Shirt Exemplo',
						price: 35,
						desiredQuantity: 3,
						availableQuantity: 2,
						sizeId: 3,
						img_number: 2
					}
				]},
			addedToBag: false, addedToBagInfo: {name: '', quantity: ''}, 
		}

		this.closeCookiesDialog = this.closeCookiesDialog.bind(this);
		this.blockedClick = this.blockedClick.bind(this);
		this.getCategoriesList = this.getCategoriesList.bind(this);
		this.getProductsList = this.getProductsList.bind(this);
		this.getSizesList = this.getSizesList.bind(this);
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
	}

	componentDidMount() {
		this.getCategoriesList();
		this.getProductsList();
		this.getSizesList();
		this.loadBagProductsFromStorage();
	}

	/* get data from API */

	getCategoriesList() {
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
		fetch(Config.apiURL + "sizes", {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(this.getSizesList, 5000);
			else resp.json().then((data) => {
				let sizes = {}
				data.sizes.forEach((size) => sizes[size.id] = {name: size.name})
				this.setState({sizes: sizes});
			})
		})
		.catch((e) => {
			setTimeout(this.getSizesList, 5000);
			console.log(e);
		});
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

	deleteProductFromBag(productId, sizeId) {
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

	render() {
		if (this.props.location.pathname == '/sacola' || this.props.location.pathname == '/')
			this.state.lastPage = this.props.location.pathname ;

		return <React.Fragment>
			<ThemeProvider theme={theme}>
				{(this.state.blockedPopup) ? <BlockedPopup blockedClick={this.blockedClick} /> : '' }
				<CustomAppBar history={this.props.history} openFilter={this.openFilter} filtered={this.state.filter.sizes.length != 0 || this.state.filter.order != 1}/>
				<div style={{display: (this.state.lastPage!='/sacola') ? 'block' : 'none'}}>
					<Catalog history={this.props.history} categories={this.state.categories} products={this.state.products} filter={this.state.filter}/>
				</div>
				<div style={{display: (this.state.lastPage=='/sacola') ? 'block' : 'none'}}>
					<Bag history={this.props.history} bag={this.state.bag} sizes={this.state.sizes} increaseProductFromBag={this.increaseProductFromBag} decreaseProductFromBag={this.decreaseProductFromBag} deleteProductFromBag={this.deleteProductFromBag}/>
				</div>
				<BottomNav location={this.props.location} history={this.props.history} bagQnt={this.state.bag.products.length}/>
				<InternalPage location={this.props.location} history={this.props.history} lastPage={this.state.lastPage}/>
				<ProductDialog sizes={this.state.sizes} addProductToBag={this.addProductToBag} location={this.props.location} history={this.props.history} lastPage={this.state.lastPage}/>
				<FilterDialog open={this.state.filterDialogOpened} filter={this.state.filter} setFilter={this.setFilter} closeFilter={this.closeFilter} sizes={this.state.sizes}/>
				<Snackbar
					autoHideDuration={2000} 
					open={this.state.addedToBag}
					onClose={this.closeAddToBag}
					TransitionComponent={Transition}
					message={`${this.state.addedToBagInfo.quantity}x ${this.state.addedToBagInfo.name} ${(this.state.addedToBagInfo.qnt == 1)?'foi adicionada':'foram adicionadas'} à sua sacola!`}
				/>
				<CookiesDialog open={this.state.cookiesDialogOpened} history={this.props.history} closeCookiesDialog={this.closeCookiesDialog}/>
			</ThemeProvider>
		</React.Fragment>
	}

}