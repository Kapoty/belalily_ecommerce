import React from "react";

import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';

import OrdersProductsTable from './OrdersProductsTable';

import { KeyboardDatePicker } from "@material-ui/pickers";

import Config from "../config/Config";
import {toDate} from "../util/Dates";
import {toCEP} from "../util/CEP";
import {toBRL} from '../util/Currency';

const useStyles = (theme) => ({
	dialogTitle: {
		paddingLeft: theme.spacing(1),
		paddingRight: theme.spacing(1),
	},
	progressArea: {
		display: 'flex',
		width: '100%',
		justifyContent: 'center',
		margin: theme.spacing(1),
	},
	orderPaper: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(2),
	},
	addressCard: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(2),
	},
	shippingOptionCard: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
	guidanceCard: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
	pixQrCode: {
		width: 256,
		height: 256,
	}
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

class OrdersDialog extends React.Component {

	constructor(props) {
		super(props);
		this.pageReg = [];
		this.pageReg[0] = new RegExp('^\/meus-pedidos$', '');
		this.pageReg[1] = new RegExp('^\/meus-pedidos\/[0-9]+$', '');
		this.state = {
			dialogOpen: false, tab: 0,
			ordersLoaded: false, orderLoaded: false,
			loadingOrders: false, loadingOrder: false,
			orders: [], order: {}, orderId: 0,
		};
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.isOpened = this.isOpened.bind(this);
		this.loadInfo = this.loadInfo.bind(this);
		this.loadOrders = this.loadOrders.bind(this);
		this.renderOrders = this.renderOrders.bind(this);
		this.renderOrder = this.renderOrder.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		this.loadInfo();
	}

	handleDialogClose() {
		this.props.history.push(this.props.lastPage);
	}

	isOpened() {
		let dialogWasOpen = this.state.dialogOpen;
		this.state.dialogOpen = false;
		for (let i=0; i<this.pageReg.length; i++)
			if (this.pageReg[i].test(this.props.location.pathname)) {
				this.state.dialogOpen = true;
				if (this.state.tab != i) {
					this.state.tab = i;
					this.state.ordersLoaded = false;
					this.state.orderLoaded = false;
				}
				if (i == 1) {
					let orderId = this.props.location.pathname.match(/meus-pedidos\/([0-9]+)/)[1];
					if (this.state.orderId != orderId) {
						this.state.orderId = orderId;
						this.state.orderLoaded = false;
					} 
				}
				break;
			}
		if (!dialogWasOpen && this.state.dialogOpen) {
			this.state.ordersLoaded = false;
			this.state.orderLoaded = false;
		}
	}

	loadInfo() {
		if (!this.state.dialogOpen)
			return;
		if (this.props.auth) {
			if (this.state.tab == 0 && !this.state.ordersLoaded && !this.state.loadingOrders) {
				this.loadOrders()
			} else if (this.state.tab == 1 && !this.state.orderLoaded && !this.state.loadingOrder) {
				this.loadOrder()
			}
		} else {
			this.state.ordersLoaded = false;
			this.state.orderLoaded = false;
		}
	}

	loadOrders() {
		this.setState({loadingOrders: true})
		fetch(Config.apiURL + "customers/me/orders", {
			method: "GET",
			headers: { 
				"Content-type": "application/json; charset=UTF-8",
				"x-customer-token": this.props.customerToken,
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if ('auth' in data || 'error' in data) {
					this.props.customerLogout();
				}
				else
					this.setState({orders: data.orders, ordersLoaded: true, loadingOrders: false});
			})
		})
		.catch((e) => {
			setTimeout(this.loadOrders, 5000);
			console.log(e);
		});
	}

	loadOrder() {
		this.setState({loadingOrder: true})
		fetch(Config.apiURL + "customers/me/orders/"+this.state.orderId, {
			method: "GET",
			headers: { 
				"Content-type": "application/json; charset=UTF-8",
				"x-customer-token": this.props.customerToken,
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if ('auth' in data) {
					this.props.customerLogout();
				} else if ('error' in data) {
					this.setState({order: {}, orderLoaded: true, loadingOrder: false});
				}
				else {
					let products = [];
					let products_id = data.order.products_product_id.split(',');
					let products_price = data.order.products_product_price.split(',');
					let products_name = data.order.products_product_name.split(',');
					let products_quantity = data.order.products_product_quantity.split(',');
					let products_size_name = data.order.products_size_name.split(',');
					products_id.forEach((pId, i) => {
						let product = {};
						product.id = pId;
						product.price = products_price[i];
						product.name = products_name[i];
						product.quantity = products_quantity[i];
						product.size_name = products_size_name[i];
						products.push(product);
					});
					data.order.products = products;
					this.setState({order: data.order, orderLoaded: true, loadingOrder: false});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.loadOrders, 5000);
			console.log(e);
		});
	}

	renderOrders() {
		const { classes } = this.props;

		let ordersEmpty = (Object.keys(this.state.orders).length === 0);

		return <React.Fragment>
			{(this.state.ordersLoaded) ? <React.Fragment>
					{(ordersEmpty) ? <Typography align='center'>
						<p>Os pedidos que você realizar aparecerão aqui.</p>
						</Typography> : this.state.orders.map((order) => {
							return <Paper className={classes.orderPaper} key={order.id}>
								<Grid container spacing={1}>
									<Grid container item spacing={1} direction="row" xs={6} sm={3}>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'><b>Número do Pedido:</b></Typography>
										</Grid>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'>#{order.id}</Typography>
										</Grid>
									</Grid>
									<Grid container item spacing={1} direction="row" xs={6} sm={3}>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'><b>Status:</b></Typography>
										</Grid>
										<Grid item xs={12}>
											<Typography align='center' style={{color: {'IN_PROGRESS': '#2196F3', 'FINISHED': '#4CAF50', 'CANCELED': '#F44336'}[order.status]}}><b>{{'IN_PROGRESS': 'Em Andamento', 'FINISHED': 'Concluído', 'CANCELED': 'Cancelado'}[order.status]}</b></Typography>
										</Grid>
									</Grid>
									<Grid container item spacing={1} direction="row" xs={6} sm={3}>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'><b>Data:</b></Typography>
										</Grid>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'>{toDate(order.creation_datetime)}</Typography>
										</Grid>
									</Grid>
									<Grid container item spacing={1} direction="row" xs={6} sm={3}>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'><b>Pagamento:</b></Typography>
										</Grid>
										<Grid item xs={12}>
											<Typography align='center' color='textPrimary'>{{'PIX': 'PIX', 'BOLETO': 'BOLETO', 'CREDIT': `CARTÃO DE CRÉDITO (em ${order.payment_installment_quantity}x)`}[order.payment_method]}</Typography>
										</Grid>
									</Grid>
									<Grid item xs={12} style={{display: 'flex', justifyContent: 'center'}}>
										<Link href={'/meus-pedidos/' + order.id} onClick={(e) => {e.preventDefault(); this.props.history.push('/meus-pedidos/' + order.id)}}>
											<Typography align='center'>Detalhes do pedido</Typography>
										</Link>
									</Grid>
								</Grid>
							</Paper>
						})}
			</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
		</React.Fragment>
	}

	renderOrder() {
		const { classes } = this.props;

		let orderEmpty = (Object.keys(this.state.order).length === 0);
		let order = this.state.order;

		return <React.Fragment>
			{(this.state.orderLoaded) ? <React.Fragment>
					{(orderEmpty) ? <Typography align='center'>
						<p>Pedido não encontrado.</p>
						</Typography> : <React.Fragment>
							<Paper className={classes.orderPaper}>
								<Grid container spacing={1}>
									<Grid container item spacing={1} direction="row" xs={6} sm={3}>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'><b>Número do Pedido:</b></Typography>
										</Grid>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'>#{order.id}</Typography>
										</Grid>
									</Grid>
									<Grid container item spacing={1} direction="row" xs={6} sm={3}>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'><b>Status:</b></Typography>
										</Grid>
										<Grid item xs={12}>
											<Typography align='center' style={{color: {'IN_PROGRESS': '#2196F3', 'FINISHED': '#4CAF50', 'CANCELED': '#F44336'}[order.status]}}><b>{{'IN_PROGRESS': 'Em Andamento', 'FINISHED': 'Concluído', 'CANCELED': 'Cancelado'}[order.status]}</b></Typography>
										</Grid>
									</Grid>
									<Grid container item spacing={1} direction="row" xs={6} sm={3}>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'><b>Data:</b></Typography>
										</Grid>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'>{toDate(order.creation_datetime)}</Typography>
										</Grid>
									</Grid>
									<Grid container item spacing={1} direction="row" xs={6} sm={3}>
										<Grid item xs={12}>
											<Typography color='textPrimary' align='center'><b>Pagamento:</b></Typography>
										</Grid>
										<Grid item xs={12}>
											<Typography align='center' color='textPrimary'>{{'PIX': 'PIX', 'BOLETO': 'BOLETO', 'CREDIT': `CARTÃO DE CRÉDITO (em ${order.payment_installment_quantity}x)`}[order.payment_method]}</Typography>
										</Grid>
									</Grid>
								</Grid>
							</Paper>
							<Typography variant="h6" gutterBottom>
								Status do Pagamento
							</Typography>
							<Stepper activeStep={{'NOT_STARTED': 0, 'AWAITING_PAYMENT': 0, 'CONFIRMED': 1, 'CANCELED': 1}[order.payment_status]}>
								<Step key={0}>
									<StepLabel>Aguardando confirmação</StepLabel>
								</Step>
								<Step key={1}>
									<StepLabel>{(order.payment_status == 'CANCELED') ? 'Cancelado' : 'Confirmado'}</StepLabel>
								</Step>
							</Stepper>
							<Typography variant="h6" gutterBottom>
								Orientações
							</Typography>
							<Paper className={classes.guidanceCard}>
								<Typography variant="body1" gutterBottom>
									{(order.payment_method == 'PIX') ? <React.Fragment>
										Confirmação do pagamento em até 1 dia útil após envio do comprovante para o email comprovantes.belalily@gmail.com <b>(obrigatório o envio do comprovante)</b><br/>
										Chave PIX: CNPJ 43.572.921/0001-31<br/>
										Se preferir, escaneie o seguinte QR Code:<br/><br/>
										<img src='/assets/image/bag/qr-code-pix.png' className={classes.pixQrCode}/>
									</React.Fragment> : ''}
									{(order.payment_method == 'BOLETO') ? <React.Fragment>
										Confirmação do pagamento em até 3 dias úteis.<br/><br/>
										<Link href={order.payment_boleto_link} target='_blank'>Clique aqui para visualizar o boleto</Link>
									</React.Fragment> : ''}
									{(order.payment_method == 'CREDIT') ? <React.Fragment>
										Confirmação do pagamento em até 2 dias úteis.<br/>
										(geralmente é confirmado dentro de 1 hora)
									</React.Fragment> : ''}
								</Typography>
							</Paper>
							{(order.shipping_status != 'NOT_STARTED') ? <React.Fragment>
								<Typography variant="h6" gutterBottom>
									Status da Entrega
								</Typography>
								<Stepper activeStep={{'IN_SEPARATION': 0, 'READY_FOR_DELIVERY': 1, 'OUT_TO_DELIVERY': 2, 'DELIVERED': 3, 'DELIVERY_FAILURE': 4}[order.shipping_status]}>
									<Step key={0}>
										<StepLabel>Produtos em separação</StepLabel>
									</Step>
									<Step key={1}>
										<StepLabel>Pronto para a entrega</StepLabel>
									</Step>
									<Step key={2}>
										<StepLabel>Saiu para a entrega</StepLabel>
									</Step>
									<Step key={3}>
										<StepLabel>{(order.shipping_status == 'DELIVERY_FAILURE') ? 'Falha na entrega' : 'Entregue'}</StepLabel>
									</Step>
								</Stepper>
							</React.Fragment> : ''}
							<OrdersProductsTable order={order}/>
							<Typography variant="h6" gutterBottom>
								Endereço de Entrega
							</Typography>
							<Paper className={classes.addressCard}>
								<Typography variant="body1" gutterBottom>
									<b>CEP:</b> {toCEP(order.shipping_cep)}<br/>
									<b>Bairro:</b> {order.shipping_district_name}<br/>
									<b>Cidade:</b> {order.shipping_city_name}<br/>
									<b>Estado:</b> {order.shipping_city_uf}<br/>
									<b>Logradouro:</b> {order.shipping_street}<br/>
									<b>Número:</b> {order.shipping_number}<br/>
									<b>Complemento:</b> {order.shipping_complement}<br/>
									<b>Observação:</b> {order.shipping_address_observation}<br/>
								</Typography>
							</Paper>
							<Typography variant="h6" gutterBottom>
								Forma de Entrega
							</Typography>
								<Paper className={classes.shippingOptionCard}>
									<Typography variant="body1" gutterBottom>
										{{FREE: `Gratuita - até 7 dias úteis após a confirmação do pagamento`,
										NORMAL: `Normal - ${toBRL(order.shipping_cost)} - até 5 dias úteis após a confirmação do pagamento`,
										EXPRESS: `Expressa - ${toBRL(order.shipping_cost)} - até 3 dias úteis após a confirmação do pagamento`}[order.shipping_type]}
									</Typography>
								</Paper>
						</React.Fragment>}
			</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
		</React.Fragment>
	}

	render() {
		const { classes } = this.props;

		this.isOpened();

		return <React.Fragment>
			<Dialog fullScreen open={this.state.dialogOpen} onClose={this.handleDialogClose} TransitionComponent={Transition}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose} className={classes.dialogTitle}>
					<Breadcrumbs aria-label="breadcrumb">
						<Typography color={(this.state.tab == 0) ? 'textPrimary' : "textSecondary"}>Meus Pedidos</Typography>
						{(this.state.tab == 1) ? <Typography color="textPrimary">#{this.state.orderId}</Typography> : ''}
					</Breadcrumbs>				
				</DialogTitle>
				<DialogContent dividers>
					{(this.props.auth) ? <React.Fragment>
						{(this.state.tab == 0) ? this.renderOrders() : this.renderOrder()}
					</React.Fragment> :
					 <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
				</DialogContent>
				<DialogActions>
					{(this.state.tab == 1) ? <Button onClick={() => this.props.history.push('/meus-pedidos')}>
						Voltar
					</Button> : ''}
					<Button onClick={this.handleDialogClose} disabled={this.state.trying}>
						Fechar
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(OrdersDialog)