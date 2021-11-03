import React from "react";

import {withStyles, useTheme} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import BagProduct from './BagProduct';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import { Alert, AlertTitle } from '@material-ui/lab';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import BagProductsTable from './BagProductsTable';
import Grid from '@material-ui/core/Grid';

import {toBRL} from '../util/Currency';
import {toCEP} from '../util/Cep';

const useStyles = (theme) => ({
	root: {
		width: '100%',
		display: 'flex',
		justifyContent: 'left',
		flexWrap: 'wrap',
	},
	stepper: {
		width: '100%',
	},
	button: {
		marginTop: theme.spacing(1),
		marginRight: theme.spacing(1),
	},
	actionsContainer: {
		marginBottom: theme.spacing(2),
	},
	cards: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
		marginBottom: theme.spacing(2),
	},
	instructions: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
		marginLeft: theme.spacing(4),
		marginRight: theme.spacing(4),
	},
	inputs: {
		width: '100%',
		display: 'flex',
		justifyContent: 'left',
		flexWrap: 'wrap',
		flexDirection: 'column',
	},
	input: {
		marginBottom: theme.spacing(1),
	},
	alert: {
		marginBottom: theme.spacing(1),
	},
	addressCard: {
		padding: theme.spacing(1),
	},
	shippingOptionCard: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
	changeAddressButton: {
		marginTop: theme.spacing(1),
		marginRight: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
	coupomCard: {
		padding: theme.spacing(1),
		marginTop: theme.spacing(1),
	}
});

class Bag extends React.Component {

	constructor(props) {
		super(props);
		this.state = {coupon: ''};
		this.handleNext = this.handleNext.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.onCouponChange = this.onCouponChange.bind(this);
		this.handleCouponSubmit = this.handleCouponSubmit.bind(this);
	}

	handleNext() {
		if (this.props.auth && this.props.bag.step == 0)
			this.props.setBagStep(2);
		else this.props.setBagStep(this.props.bag.step+1);
	}

	handleBack() {
		if (this.props.bag.step !=2)
			this.props.setBagStep(this.props.bag.step-1);
		else this.props.setBagStep(0);
	}

	componentDidUpdate(prevProps) {
		if (this.props.auth && this.props.bag.step == 1)
			this.props.setBagStep(2);
		if (!this.props.auth && this.props.bag.step > 1)
			this.props.setBagStep(1);

		// validar entrega gratuita
		let customerInfoLoaded = !(Object.keys(this.props.customerInfo).length === 0);
		let districtsLoaded = !(this.props.districts.length === 0);
		if (customerInfoLoaded && districtsLoaded && this.props.bag.shippingType == 'FREE' && 
			!this.props.districtsById[this.props.customerInfo.district_id].shipping_free_available)
			this.props.setBagShippingType('');
	}


	onCouponChange(e) {
		this.setState({coupon: e.target.value});
	}

	handleCouponSubmit(e) {
		if (e != undefined)
			e.preventDefault();

		this.props.handleCouponSubmit(this.state.coupon);
	}

	getCouponDescription(preOrder) {
		let coupon = preOrder.coupon;
		switch(coupon.type.toLowerCase()) {
			case 'percent':
				return <React.Fragment>
							{coupon.value}% de desconto no valor total dos produtos<br/>
							Valor mínimo: {toBRL(coupon.minimum_amount)}<br/>
							Máximo de unidades: {coupon.max_units}
						</React.Fragment>
			break;
			case 'gross':
				return <React.Fragment>
							{toBRL(coupon.value)} de desconto no valor total dos produtos<br/>
							Valor mínimo: {toBRL(coupon.minimum_amount)}<br/>
							Máximo de unidades: {coupon.max_units}
						</React.Fragment>
			break;
			case 'twopercent':
				return <React.Fragment>
							{coupon.value}% de desconto no segundo item<br/>
							Valor mínimo: {toBRL(coupon.minimum_amount)}<br/>
							Máximo de unidades: {coupon.max_units}
						</React.Fragment>
			break;
			case 'twogross':
				return <React.Fragment>
							{toBRL(coupon.value)} de desconto no segundo item<br/>
							Valor mínimo: {toBRL(coupon.minimum_amount)}<br/>
							Máximo de unidades: {coupon.max_units}
						</React.Fragment>
			break;
		}
		return 'desc';
	}

	render() {
		const { classes } = this.props;

		let totalUnits = 0; 
		for (let i=0; i<this.props.bag.products.length; i++)
			totalUnits += this.props.bag.products[i].desiredQuantity;
		let hasUnavailable = false;
		for (let i=0; i<this.props.bag.products.length; i++)
			if (this.props.bag.products[i].availableQuantity == 0 ||
				this.props.bag.products[i].desiredQuantity > this.props.bag.products[i].availableQuantity) {
				hasUnavailable = true;
				break;
			}

		let customerInfoLoaded = !(Object.keys(this.props.customerInfo).length === 0);
		let citiesLoaded = !(Object.keys(this.props.citiesById).length === 0);
		let districtsLoaded = !(this.props.districts.length === 0);
		let sizesLoaded = !(Object.keys(this.props.sizesById).length === 0);
		let preOrderLoaded = !(Object.keys(this.props.bag.preOrder).length === 0);

		return <React.Fragment>
			<div className={classes.root}>
				<Stepper activeStep={this.props.bag.step} orientation="vertical" className={classes.stepper}>
					<Step key={0}>
						<StepLabel>Adicione itens à sua sacola</StepLabel>
						<StepContent>
							<div className={classes.cards}>
								{this.props.bag.products.map((product) => 
									<BagProduct key={product.id+'-'+product.sizeId} product={product} sizesById={this.props.sizesById}
									increaseProductFromBag={this.props.increaseProductFromBag}
									decreaseProductFromBag={this.props.decreaseProductFromBag}
									deleteProductFromBag={this.props.deleteProductFromBag}
									history={this.props.history}/>)}
							</div>
							{(totalUnits > this.props.bag.limit) ?
								<Alert severity="error" className={classes.alert}>
									<AlertTitle>Limite excedido</AlertTitle>
									Máximo de unidades por pedido: {this.props.bag.limit}
								</Alert> : ''}
							{(hasUnavailable) ? <Alert severity="error" className={classes.alert}>
									<AlertTitle>Há produtos indisponíveis na sua sacola</AlertTitle>
								</Alert> : ''}
							<div className={classes.actionsContainer}>
								<div>
									<Button
										className={classes.button}
										disabled={true}
									>
										Voltar
									</Button>
									<Button
										variant="contained"
										color="primary"
										className={classes.button}
										onClick={this.handleNext}
										disabled={hasUnavailable || totalUnits > this.props.bag.limit || totalUnits == 0}
									>
										Avançar
									</Button>
								</div>
							</div>
						</StepContent>
					</Step>
					<Step key={1}>
						<StepLabel>Se identifique</StepLabel>
						<StepContent>
							<Button className={classes.button} variant='contained' color='primary' onClick={() => this.props.history.push('/entrar')}>Já possuo uma conta</Button>
							<Button className={classes.button} variant='contained' color='primary' onClick={() => this.props.history.push('/cadastrar')}>Quero me cadastrar</Button>
							<br/>
							<Button
								className={classes.button}
								onClick={this.handleBack}
							>
								Voltar
							</Button>
							<Button
								variant="contained"
								color="primary"
								className={classes.button}
								onClick={this.handleNext}
								disabled={!this.props.auth}
							>
								Avançar
							</Button>
						</StepContent>
					</Step>
					<Step key={2}>
						<StepLabel>Determine onde e como será feita a entrega</StepLabel>
						<StepContent>
							<Typography variant="h6" gutterBottom>
								Endereço de Entrega
							</Typography>
							<Paper className={classes.addressCard}>
								{(customerInfoLoaded) ?
									<Typography variant="body1" gutterBottom>
										<b>CEP:</b> {toCEP(this.props.customerInfo.cep)}<br/>
										<b>Bairro:</b> {(districtsLoaded) ? this.props.districtsById[this.props.customerInfo.district_id].name : '...'}<br/>
										<b>Cidade:</b> {(districtsLoaded && citiesLoaded) ? this.props.citiesById[this.props.districtsById[this.props.customerInfo.district_id].city_id].name : '...'}<br/>
										<b>Estado:</b> {(districtsLoaded && citiesLoaded) ? this.props.citiesById[this.props.districtsById[this.props.customerInfo.district_id].city_id].uf : '...'}<br/>
										<b>Logradouro:</b> {this.props.customerInfo.street}<br/>
										<b>Número:</b> {this.props.customerInfo.number}<br/>
										<b>Complemento:</b> {this.props.customerInfo.complement}<br/>
										<b>Observação:</b> {this.props.customerInfo.address_observation}<br/>
									</Typography>
									: ''}
							</Paper>
							<Button className={classes.changeAddressButton} variant='contained' color='primary' onClick={() => this.props.history.push('/perfil/endereco')}>Atualizar endereço de entrega</Button>
							<Typography variant="h6" gutterBottom>
								Forma de Entrega
							</Typography>
							{(customerInfoLoaded && districtsLoaded) ?
								<FormControl component="fieldset">
									<RadioGroup aria-label="shippingType" name="shippingType" value={this.props.bag.shippingType} onChange={(e) => this.props.setBagShippingType(e.target.value)}>
										{(this.props.districtsById[this.props.customerInfo.district_id].shipping_free_available) ? <Paper className={classes.shippingOptionCard}><FormControlLabel value="FREE" control={<Radio />} label="Gratuita - até 7 dias úteis após a confirmação do pagamento" /></Paper> : ''}
										<Paper className={classes.shippingOptionCard}><FormControlLabel value="NORMAL" control={<Radio />} label={`Normal - ${toBRL(this.props.districtsById[this.props.customerInfo.district_id].shipping_normal_price)} - até 2 dias úteis após a confirmação do pagamento`} /></Paper>
										<Paper className={classes.shippingOptionCard}><FormControlLabel value="EXPRESS" control={<Radio />} label={`Expressa - ${toBRL(this.props.districtsById[this.props.customerInfo.district_id].shipping_express_price)} - até 1 dia útil após a confirmação do pagamento`} /></Paper>
									</RadioGroup>
								</FormControl> : ''}
							<br/>
							<Button
								className={classes.button}
								onClick={this.handleBack}
							>
								Voltar
							</Button>
							<Button
								variant="contained"
								color="primary"
								className={classes.button}
								onClick={this.handleNext}
								disabled={this.props.bag.shippingType == ''}
							>
								Avançar
							</Button>
						</StepContent>
					</Step>
					<Step key={3}>
						<StepLabel>Escolha a forma de pagamento e confirme o pedido</StepLabel>
						<StepContent>
							<BagProductsTable preOrder={this.props.bag.preOrder} sizesById={this.props.sizesById}/>
							<Paper className={classes.coupomCard}>
								<Grid container spacing={1} alignItems="center">
									<Grid item xs={9}>
									<form action="#" onSubmit={this.handleCouponSubmit} >
										<TextField
											fullWidth
											onChange={this.onCouponChange}
											margin="normal"
											id="coupon"
											label="Cupom"
											value={(this.props.bag.preOrder.coupon_applied) ? this.props.bag.preOrder.coupon.code : this.state.coupon}
											disabled={(this.props.bag.preOrder.coupon_applied) || !preOrderLoaded}
											error={this.state.errorInput == 'coupon'}
											helperText={(this.state.errorInput == 'coupon') ? '' : ''}
											InputProps={{
												inputProps: {
													maxLength: 10
												}
											}}
										/>
									</form>
									</Grid>
									<Grid item xs={3}>
										<Button variant="contained" color="primary" onClick={this.handleCouponSubmit} disabled={!preOrderLoaded || (this.state.coupon == '' && !this.props.bag.preOrder.coupon_applied)}>{(this.props.bag.preOrder.coupon_applied) ? 'Remover' : 'Aplicar'}</Button>
									</Grid>
									{(this.props.bag.preOrder.coupon_applied) ? <Grid item xs={12}>
										<Alert severity="success">
											<AlertTitle>Cupom aplicado!</AlertTitle>
											{this.getCouponDescription(this.props.bag.preOrder)}
										</Alert>
									</Grid> : ''}
								</Grid>
							</Paper>
							<Button
								className={classes.button}
								onClick={this.handleBack}
							>
								Voltar
							</Button>
							<Button
								variant="contained"
								color="primary"
								className={classes.button}
								onClick={this.handleNext}
								disabled={this.props.bag.shippingType == ''}
							>
								Efetuar Pedido
							</Button>
						</StepContent>
					</Step>
				</Stepper>
			</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(Bag)