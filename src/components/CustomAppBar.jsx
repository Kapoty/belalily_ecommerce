import React from "react";

import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import StoreIcon from '@material-ui/icons/Store';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ScreenLockPortraitIcon from '@material-ui/icons/ScreenLockPortrait';
import InstagramIcon from '@material-ui/icons/Instagram';
import WhatsappIcon from '@material-ui/icons/Whatsapp';
import Link from '@material-ui/core/Link';
import AssignmentReturnIcon from '@material-ui/icons/AssignmentReturn';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import FaceIcon from '@material-ui/icons/Face';
import MailIcon from '@material-ui/icons/Mail';

const useStyles = (theme) => ({
	logoArea: {
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: theme.palette.primary.main,
	},
	logo: {
		position: 'absolute',
		left: '50%',
		top: '50%',
		height: '80%',
		transform: 'translate(-50%, -50%)',
	},
	grow: {
    	flexGrow: 1,
  	},
  	cnpj: {
  		marginTop: theme.spacing(2),
  		marginBottom: theme.spacing(1),
  	}
});

class CustomAppBar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {menuAnchor: null, customerMenuAnchor: null};
		this.handleMenuOpen = this.handleMenuOpen.bind(this);
		this.handleMenuClose = this.handleMenuClose.bind(this);
		this.handleMenuClick = this.handleMenuClick.bind(this);
		this.handleCustomerMenuOpen = this.handleCustomerMenuOpen.bind(this);
		this.handleCustomerMenuClose = this.handleCustomerMenuClose.bind(this);
		this.handleCustomerLogout = this.handleCustomerLogout.bind(this);
		this.handleCustomerProfile = this.handleCustomerProfile.bind(this);
		this.handleCustomerOrders = this.handleCustomerOrders.bind(this);
	}

	handleMenuOpen = (event) => {
		this.setState({menuAnchor: event.currentTarget});
	};

	handleMenuClose = (event) => {
		this.setState({menuAnchor: null});
	};

	handleMenuClick = (page) => {
		this.setState({menuAnchor: null});
		this.props.history.push(page);
	}

	openWhatsapp() {
		const url = `https://api.whatsapp.com/send?phone=05562983118355&text=Olá, tudo bem?`;
		var encoded = encodeURI(url);
		window.open(encoded, '_blank');
	}

	handleCustomerMenuOpen = (event) => {
		this.setState({customerMenuAnchor: event.currentTarget});
	};

	handleCustomerMenuClose = (event) => {
		this.setState({customerMenuAnchor: null});
	};

	handleCustomerLogout() {
		this.setState({customerMenuAnchor: null});
		this.props.customerLogout();
	}

	handleCustomerProfile() {
		this.setState({customerMenuAnchor: null});
		this.props.history.push('/perfil')
	}

	handleCustomerOrders() {
		this.setState({customerMenuAnchor: null});
		this.props.history.push('/meus-pedidos')
	}

	render() {
		const { classes } = this.props;

		let customerInfoLoaded = !(Object.keys(this.props.customerInfo).length === 0);

		return <React.Fragment>
			<AppBar position="fixed">
				<Toolbar>
					<IconButton edge="start" color="inherit" aria-label="menu" onClick={this.handleMenuOpen}>
						<MenuIcon />
					</IconButton>
					<img className={classes.logoImg} src='./assets/image/logo-small.png' onClick={() => this.props.history.push('/')}/>
					<Drawer anchor={'left'} open={Boolean(this.state.menuAnchor)} onClose={this.handleMenuClose}>
						<div className={classes.logoArea}><Link href="#/" onClick={() => this.props.history.push("")}><img src='./assets/image/logo-256.png'/></Link></div>
						<List>
							{/*<ListItem button key={0} onClick={() => this.handleMenuClick('/entrega-gratis')}>
								<ListItemIcon><LocalShippingIcon /></ListItemIcon>
								<ListItemText primary={"Entrega Grátis"} />
							</ListItem>*/}
							<ListItem button key={1} onClick={() => this.handleMenuClick('/troca-devolucao')}>
								<ListItemIcon><AssignmentReturnIcon /></ListItemIcon>
								<ListItemText primary={"Troca/Devolução"} />
							</ListItem>
							<ListItem button key={2} onClick={() => this.handleMenuClick('/perguntas-frequentes')}>
								<ListItemIcon><QuestionAnswerIcon /></ListItemIcon>
								<ListItemText primary={"Perguntas Frequentes"} />
							</ListItem>
							<ListItem button key={3} onClick={() => this.handleMenuClick('/quem-somos')}>
								<ListItemIcon><StoreIcon /></ListItemIcon>
								<ListItemText primary={"Quem Somos"} />
							</ListItem>
							<ListItem button key={4} onClick={() => this.handleMenuClick('/termos-de-uso')}>
								<ListItemIcon><AssignmentIcon /></ListItemIcon>
								<ListItemText primary={"Termos de Uso"} />
							</ListItem>
							<ListItem button key={5} onClick={() => this.handleMenuClick('/politica-de-privacidade')}>
								<ListItemIcon><ScreenLockPortraitIcon /></ListItemIcon>
								<ListItemText primary={"Política de Privacidade"} />
							</ListItem>
						</List>
						<Divider/>
						<List>
							<ListItem button key={5} onClick={() => window.open('https://www.instagram.com/belalily_mf/', '_blank')}>
								<ListItemIcon><InstagramIcon /></ListItemIcon>
								<ListItemText primary={"@belalily_mf"} />
							</ListItem>
							<ListItem button key={6} onClick={this.openWhatsapp}>
								<ListItemIcon><WhatsappIcon /></ListItemIcon>
								<ListItemText primary={"(62) 9 8311-8355"} />
							</ListItem>
							<ListItem button key={6} onClick={() => window.open('mailto:mailto:atendimento.belalily@gmail.com')}>
								<ListItemIcon><MailIcon /></ListItemIcon>
								<ListItemText primary={"atendimento.belalily@gmail.com"} />
							</ListItem>
							<Divider/>
							<Typography className={classes.cnpj} align="center" variant="subtitle2">CNPJ 43.572.921/0001-31</Typography>
						</List>
					</Drawer>
					<img className={classes.logo} src='./assets/image/logo-texto.png' onClick={() => this.props.history.push('/')}/>
					<div className={classes.grow} />
					{(this.props.auth) ? <React.Fragment>
							<IconButton edge="end" color="inherit" aria-label="account" style={{marginLeft: '20px'}} onClick={this.handleCustomerMenuOpen}>
								<AccountCircleIcon />
							</IconButton>
							<Menu
								id="menu-appbar"
								anchorEl={this.state.customerMenuAnchor}
								anchorOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								keepMounted
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								open={Boolean(this.state.customerMenuAnchor)}
								onClose={this.handleCustomerMenuClose}
							>
								
								{(customerInfoLoaded) ? <List>
									<ListItem>
										<ListItemIcon><FaceIcon /></ListItemIcon>
										<ListItemText primary={this.props.customerInfo.desired_name} />
									</ListItem>
								</List> : ''}
								<MenuItem onClick={this.handleCustomerProfile}>Meu Perfil</MenuItem>
								<MenuItem onClick={this.handleCustomerOrders}>Meus Pedidos</MenuItem>
								<MenuItem onClick={this.handleCustomerLogout}>Sair</MenuItem>
							</Menu>
						</React.Fragment>
						: <Button color="inherit" style={{marginLeft: '20px'}} onClick={() => this.props.history.push('/entrar')}>Entrar</Button>}
				</Toolbar>
			</AppBar>
			<Toolbar><img className={classes.logoImg} src='./assets/image/logo-small.png'/></Toolbar>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(CustomAppBar)