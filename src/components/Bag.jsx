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
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';

import {toBRL} from '../util/Currency';
import {toCEP} from '../util/Cep';

import PropTypes from 'prop-types';
import MaskedInput from 'react-text-mask';

function CardNumberMaskCustom(props) {
	const { inputRef, ...other } = props;

	return (
	<MaskedInput
		{...other}
		ref={(ref) => {
		inputRef(ref ? ref.inputElement : null);
		}}
		mask={[ /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/]}
		placeholderChar={'_'}
	/>
	);
}

CardNumberMaskCustom.propTypes = {
	inputRef: PropTypes.func.isRequired,
};

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
		marginBottom: theme.spacing(1),
	},
	paymentCard: {
		padding: theme.spacing(1),
		marginTop: theme.spacing(1),
	},
	paymentTabs: {
	},
	paymentPrice: {
		marginTop: theme.spacing(1),
	},
	paymentDescription: {
		marginTop: theme.spacing(1),
	},
	paymentCardData: {
		marginTop: theme.spacing(1),
		display: 'flex',
		justifyContent: 'center',
	},
	paymentCardBrands: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
});

class Bag extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			coupon: '',
			cardNumber: "", cardCvv: "", cardExpirationMonth: "", cardExpirationYear: "", cardHolder: '',
			creatingCardToken: false,
		};
		this.handleNext = this.handleNext.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.onCouponChange = this.onCouponChange.bind(this);
		this.handleCouponSubmit = this.handleCouponSubmit.bind(this);
		this.onCardNumberChange = this.onCardNumberChange.bind(this);
		this.canCreateOrder = this.canCreateOrder.bind(this);
		this.createPagseguroCardTokenSuccess = this.createPagseguroCardTokenSuccess.bind(this);
		this.createPagseguroCardTokenFailure = this.createPagseguroCardTokenFailure.bind(this);
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

	componentDidUpdate(prevProps, prevState) {
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

		// criar token do cartão

		if (prevState.cardNumber != this.state.cardNumber ||
			prevState.cardExpirationMonth != this.state.cardExpirationMonth ||
			prevState.cardExpirationYear != this.state.cardExpirationYear ||
			prevState.cardCvv != this.state.cardCvv) {

			if (this.state.cardNumber.replace(/[^0-9]/g, '').length == 16 &&
				this.state.cardExpirationMonth.length > 0 &&
				this.state.cardExpirationYear.length == 4 &&
				this.state.cardCvv.length >= 3) {
				if (!this.state.creatingCardToken && this.props.pagseguro.cardToken == '') {
					this.setState({creatingCardToken: true});
					PagSeguroDirectPayment.createCardToken({
						cardNumber: this.state.cardNumber, // Número do cartão de crédito
						brand: this.props.pagseguro.cardBrand, // Bandeira do cartão
						cvv: this.state.cardCvv, // CVV do cartão
						expirationMonth: this.state.cardExpirationMonth, // Mês da expiração do cartão
						expirationYear: this.state.cardExpirationYear, // Ano da expiração do cartão, é necessário os 4 dígitos.
						success: this.createPagseguroCardTokenSuccess,
						error: this.createPagseguroCardTokenFailure
					});
				}
			} else if (this.props.pagseguro.cardToken != '')
				this.props.setPagseguroCardToken('');

		}
	}

	createPagseguroCardTokenSuccess(response) {
		this.setState({creatingCardToken: false});
		this.props.setPagseguroCardToken(response.card.token);
	}

	createPagseguroCardTokenFailure(response) {
		this.props.setOrderErrorMessage(response.errors[Object.keys(response.errors)[0]]);
		this.setState({creatingCardToken: false});
	}


	onCouponChange(e) {
		this.setState({coupon: e.target.value.toUpperCase()});
	}

	handleCouponSubmit(e) {
		if (e != undefined)
			e.preventDefault();

		this.props.handleCouponSubmit(this.state.coupon);
	}

	getCouponDescription(preOrder) {
		let coupon = preOrder.coupon;
		switch(coupon.type) {
			case 'PERCENT':
				return <React.Fragment>
							{coupon.value}% de desconto no valor total dos produtos<br/>
							Valor mínimo: {toBRL(coupon.minimum_amount)}<br/>
							Máximo de unidades: {coupon.max_units}
						</React.Fragment>
			break;
			case 'GROSS':
				return <React.Fragment>
							{toBRL(coupon.value)} de desconto no valor total dos produtos<br/>
							Valor mínimo: {toBRL(coupon.minimum_amount)}<br/>
							Máximo de unidades: {coupon.max_units}
						</React.Fragment>
			break;
			case 'TWO_PERCENT':
				return <React.Fragment>
							{coupon.value}% de desconto em um item, a cada dois itens<br/>
							Valor mínimo: {toBRL(coupon.minimum_amount)}<br/>
							Máximo de unidades: {coupon.max_units}
						</React.Fragment>
			break;
			case 'TWO_GROSS':
				return <React.Fragment>
							{toBRL(coupon.value)} de desconto em um item, a cada dois itens<br/>
							Valor mínimo: {toBRL(coupon.minimum_amount)}<br/>
							Máximo de unidades: {coupon.max_units}
						</React.Fragment>
			break;
		}
		return '';
	}

	onCardNumberChange(e) {
		let number = e.target.value.replace(/[^0-9]/g, '');
		if (number.length >= 6) {
			this.props.getPagseguroCardBrand(parseInt(number));
		} else this.props.setPagseguroCardBrand('');
		this.setState({cardNumber: e.target.value});
	}

	canCreateOrder() {
		let preOrderLoaded = !(Object.keys(this.props.bag.preOrder).length === 0);
		if (this.props.bag.creatingOrder || !preOrderLoaded)
			return false;
		if (this.props.bag.paymentType != 2)
			return true;
		else return (this.state.cardNumber.replace(/[^0-9]/g, '').length == 16 &&
			this.state.cardExpirationMonth.length > 0 &&
			this.state.cardExpirationYear.length == 4 &&
			/*this.state.cardHolder != '' &&*/
			this.state.cardCvv.length >= 3 &&
			this.props.pagseguro.selectedInstallment != 0 &&
			this.props.pagseguro.cardToken != '' &&
			this.props.pagseguro.senderHash !='')
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
		let paymentMethodsLoaded = !(Object.keys(this.props.pagseguro.paymentMethods).length === 0);

		return <React.Fragment>
			<div className={classes.root}>
				<Stepper activeStep={this.props.bag.step} orientation="vertical" className={classes.stepper}>
					<Step key={0}>
						<StepLabel>Adicione itens à sua sacola</StepLabel>
						<StepContent>
							{(this.props.bag.step == 0) ? <React.Fragment>
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
							</React.Fragment> : ''}
						</StepContent>
					</Step>
					<Step key={1}>
						<StepLabel>Se identifique</StepLabel>
						<StepContent>
							{(this.props.bag.step == 1) ? <React.Fragment>
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
							</React.Fragment> : ''}
						</StepContent>
					</Step>
					<Step key={2}>
						<StepLabel>Determine onde e como será feita a entrega</StepLabel>
						<StepContent>
							{(this.props.bag.step == 2) ? <React.Fragment>
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
							</React.Fragment> : ''}
						</StepContent>
					</Step>
					<Step key={3}>
						<StepLabel>Escolha a forma de pagamento e confirme o pedido</StepLabel>
						<StepContent>
							{(this.props.bag.step == 3) ? <React.Fragment>
								<BagProductsTable preOrder={this.props.bag.preOrder} sizesById={this.props.sizesById}/>
								<Paper className={classes.coupomCard}>
									<Grid container spacing={1} alignItems="center" justifyContent='center'>
										<Grid item xs>
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
										<Grid item xs={4} sm={2}>
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
								<Typography variant="h6" gutterBottom>
									Forma de Pagamento
								</Typography>
								<Paper className={classes.paymentCard}>
									<Tabs
										value={this.props.bag.paymentType}
										onChange={(e, newValue) => this.props.setBagPaymentType(newValue)}
										indicatorColor="primary"
										textColor="primary"
										className={classes.paymentTabs}
									>
										<Tab label="PIX" />
										<Tab label="Boleto" />
										<Tab label="Cartão de Crédito" />
									</Tabs>
									{(preOrderLoaded) ? <React.Fragment>
										{(this.props.bag.paymentType == 0) ? <div className={classes.paymentPrice}>
											<Typography variant="h4" color="primary" component="p" align="center">
												<b>{toBRL(this.props.bag.preOrder.total_in_cash)}</b>
											</Typography>
											<Typography variant="subtitle2" component="p" align="center" color="textSecondary" gutterBottom>
												à vista no PIX com até <b>5% OFF</b>
											</Typography>
											<Typography variant="body1" component="p" align="center" color="textPrimary" className={classes.paymentDescription}>
												Confirmação do pagamento em até 1 dia útil após envio do comprovante para o email comprovantes@belalily.com.br
											</Typography>
										</div>
										: ''}
										{(this.props.bag.paymentType == 1) ? <div className={classes.paymentPrice}>
											<Typography variant="h4" color="primary" component="p" align="center">
												<b>{toBRL(this.props.bag.preOrder.total_in_cash)}</b>
											</Typography>
											<Typography variant="subtitle2" component="p" align="center" color="textSecondary" gutterBottom>
												à vista no Boleto com até <b>5% OFF</b>
											</Typography>
											<Typography variant="body1" component="p" align="center" color="textPrimary" className={classes.paymentDescription}>
												Confirmação do pagamento em até 3 dias úteis.
											</Typography>
										</div>
										: ''}
										{(this.props.bag.paymentType == 2) ? <React.Fragment>
											<div className={classes.paymentPrice}>
												<Typography variant="h4" color="primary" component="p" align="center">
													<b>{toBRL(this.props.bag.preOrder.total)}</b>
												</Typography>
												<Typography variant="subtitle2" component="p" align="center" color="textSecondary" gutterBottom>
													em até 12x
												</Typography>
												<Typography variant="body1" component="p" align="center" color="textPrimary" className={classes.paymentDescription}>
													Confirmação do pagamento em até 2 dias úteis.<br/>
													(geralmente é confirmado dentro de 1 hora)
												</Typography>
											</div>
											<div className={classes.paymentCardData}>
												<Grid container spacing={1} justifyContent='center' style={{maxWidth: '600px'}}>
													<Grid item xs={12}>
														<Typography variant="h6" align="center" gutterBottom>
															Dados do Cartão
														</Typography>
													</Grid>
													{(this.props.pagseguro.sessionId != '') ? <React.Fragment>
														<Grid item xs={9}>
															<TextField
																fullWidth
																required
																onChange={this.onCardNumberChange}
																margin="normal"
																id="cardNumber"
																label="Número"
																value={this.state.cardNumber}
																disabled={false}
																placeholder="0000 0000 0000 0000"
																InputProps={{
																	inputComponent: CardNumberMaskCustom,
																}}
															/>
														</Grid>
														<Grid item xs={3} style={{display: 'flex', justifyContent: 'left', alignItems: 'center'}}>
															{(this.props.pagseguro.cardBrand != '') ? <img src={`https://stc.pagseguro.uol.com.br/public/img/payment-methods-flags/68x30/${this.props.pagseguro.cardBrand}.png`}/> : ''}
														</Grid>
														<Grid item xs={4}>
															<TextField
																fullWidth
																required
																onChange={(e) => this.setState({cardCvv: e.target.value})}
																margin="normal"
																id="cardCvv"
																label="CVV"
																value={this.state.cardCvv}
																disabled={false}
																placeholder="0000"
																InputProps={{
																	inputProps: {
																		maxLength: 4
																	}
																}}
															/>
														</Grid>
														<Grid item xs={4}>
															<TextField
																fullWidth
																required
																onChange={(e) => this.setState({cardExpirationMonth: e.target.value})}
																margin="normal"
																id="cardExpirationMonth"
																label="Mês de Vencimento"
																value={this.state.cardExpirationMonth}
																disabled={false}
																placeholder="00"
																InputProps={{
																	inputProps: {
																		maxLength: 2
																	}
																}}
															/>
														</Grid>
														<Grid item xs={4}>
															<TextField
																fullWidth
																required
																onChange={(e) => this.setState({cardExpirationYear: e.target.value})}
																margin="normal"
																id="cardExpirationYear"
																label="Ano de Vencimento"
																value={this.state.cardExpirationYear}
																disabled={false}
																placeholder="0000"
																InputProps={{
																	inputProps: {
																		maxLength: 4
																	}
																}}
															/>
														</Grid>
														{/*<Grid item xs={12}>
															<TextField
																required
																onChange={(e) => this.setState({cardHolder: e.target.value})}
																fullWidth
																margin="normal"
																id="cardHolder"
																label="Nome Impresso no Cartão"
																value={this.state.cardHolder}
																disabled={false}
																InputProps={{
																	inputProps: {
																		maxLength: 50
																	}
																}}
															/>
														</Grid>*/}
														<Grid item xs={12}>
															<FormControl style={{width: '100%'}}>
																<InputLabel htmlFor="payment">Opções de Parcelamento</InputLabel>
																<Select
																	native
																	value={this.props.pagseguro.selectedInstallment}
																	onChange={(e) => this.props.setPagseguroSelectedInstallment(e.target.value)}
																	label="Opções de Parcelamento"
																	inputProps={{
																	name: 'Opções de Parcelamento',
																	id: 'payment',
																	}}
																>
																	<option aria-label="Selecione" value={0}>Selecione</option>
																	{this.props.pagseguro.cardInstallments.map((installment, i) => <option value={i+1} key={i+1}>{installment.quantity}x de {toBRL(installment.installmentAmount)} (total {toBRL(installment.totalAmount)})</option>)};
																</Select>
															</FormControl>
														</Grid>
														{(paymentMethodsLoaded) ? <Grid item xs={12} className={classes.paymentCardBrands}>
															{Object.keys(this.props.pagseguro.paymentMethods.CREDIT_CARD.options).map((option, i) => 
																<img key={i} src={'https://stc.pagseguro.uol.com.br'+this.props.pagseguro.paymentMethods.CREDIT_CARD.options[option].images.SMALL.path}/>)}
														</Grid> : ''}
													</React.Fragment> : <CircularProgress color="primary"/>}
												</Grid>
											</div>
										</React.Fragment> : ''}
									</React.Fragment> : ''}
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
									onClick={this.props.createOrder}
									disabled={!this.canCreateOrder()}
								>
									Efetuar Pedido
								</Button>
							</React.Fragment> : ''}
						</StepContent>
					</Step>
					{(this.props.bag.step == 4) ? <Step key={4}>
						<StepLabel>Acompanhe o seu pedido</StepLabel>
						<StepContent>
							<Typography variant="h6" gutterBottom>
									Pedido Realizado! :)
							</Typography>
							{JSON.stringify(this.props.bag.orderInfo)}
							<br/>
							<Button
								className={classes.button}
								onClick={() => this.props.setBagStep(0)}
							>
								Efetuar um novo pedido
							</Button>
						</StepContent>
					</Step> : <React.Fragment></React.Fragment>}
				</Stepper>
			</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(Bag)