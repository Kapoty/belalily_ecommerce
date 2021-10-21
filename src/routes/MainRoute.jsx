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
		}

		this.closeCookiesDialog = this.closeCookiesDialog.bind(this);
		this.blockedClick = this.blockedClick.bind(this);
		this.getCategoriesList = this.getCategoriesList.bind(this);
		this.getProductsList = this.getProductsList.bind(this);
		this.getSizesList = this.getSizesList.bind(this);
	}

	componentDidMount() {
		this.getCategoriesList();
		this.getProductsList();
		this.getSizesList();
	}

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
			console.log(e);
		});
	}

	closeCookiesDialog() {
		cookies.set('cookiesDialog', '0', {maxAge: 7 * 86400});
		this.setState({cookiesDialogOpened: false});
	}

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

	render() {
		if (this.props.location.pathname == '/sacola' || this.props.location.pathname == '/')
			this.state.lastPage = this.props.location.pathname ;

		return <React.Fragment>
			<ThemeProvider theme={theme}>
				{(this.state.blockedPopup) ? <BlockedPopup blockedClick={this.blockedClick} /> : '' }
				<CustomAppBar history={this.props.history}/>
				<div style={{display: (this.state.lastPage!='/sacola') ? 'block' : 'none'}}>
					<Catalog history={this.props.history} categories={this.state.categories} products={this.state.products}/>
				</div>
				<div style={{display: (this.state.lastPage=='/sacola') ? 'block' : 'none'}}>
					Sacola
				</div>
				<BottomNav location={this.props.location} history={this.props.history} bagQnt={1}/>
				<InternalPage location={this.props.location} history={this.props.history} lastPage={this.state.lastPage}/>
				<ProductDialog sizes={this.state.sizes} location={this.props.location} history={this.props.history} lastPage={this.state.lastPage}/>
				<CookiesDialog open={this.state.cookiesDialogOpened} history={this.props.history} closeCookiesDialog={this.closeCookiesDialog}/>
			</ThemeProvider>
		</React.Fragment>
	}

}