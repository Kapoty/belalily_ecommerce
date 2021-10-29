import React from "react";

import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { Alert, AlertTitle } from '@material-ui/lab';

import { KeyboardDatePicker } from "@material-ui/pickers";

import PropTypes from 'prop-types';
import MaskedInput from 'react-text-mask';

import Config from "../config/Config";

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
	}
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

function NumberMaskCustom(props) {
	const { inputRef, ...other } = props;

	return (
	<MaskedInput
		{...other}
		ref={(ref) => {
		inputRef(ref ? ref.inputElement : null);
		}}
		mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
		placeholderChar={'_'}
	/>
	);
}

NumberMaskCustom.propTypes = {
	inputRef: PropTypes.func.isRequired,
};

function CPFMaskCustom(props) {
	const { inputRef, ...other } = props;

	return (
	<MaskedInput
		{...other}
		ref={(ref) => {
		inputRef(ref ? ref.inputElement : null);
		}}
		mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
		placeholderChar={'_'}
	/>
	);
}

CPFMaskCustom.propTypes = {
	inputRef: PropTypes.func.isRequired,
};

function CEPMaskCustom(props) {
	const { inputRef, ...other } = props;

	return (
	<MaskedInput
		{...other}
		ref={(ref) => {
		inputRef(ref ? ref.inputElement : null);
		}}
		mask={[/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]}
		placeholderChar={'_'}
	/>
	);
}

CEPMaskCustom.propTypes = {
	inputRef: PropTypes.func.isRequired,
};

class ProfileDialog extends React.Component {

	constructor(props) {
		super(props);
		this.pageReg = [];
		this.pageReg[0] = new RegExp('(^\/perfil$)', '');
		this.pageReg[1] = new RegExp('(^\/perfil/endereco$)', '');
		this.pageReg[2] = new RegExp('(^\/perfil/acesso$)', '');
		this.pageReg[3] = new RegExp('(^\/perfil/recuperacao$)', '');
		this.pageReg[4] = new RegExp('(^\/perfil/notificacoes$)', '');
		this.state = {dialogOpen: false, tab: 0, editing: 0,
			name: '', desired_name: '', birthday: null, mobile: '', whatsapp: '',
			cep: '', district: null, street: '', number: '', complement: '', address_observation: '',
			password: '', new_password: '', new_password_confirm: '',
			secret_question: null, secret_answer: '',
			allow_email: false, allow_whatsapp: false,
			errorInput: '', errorMessage: '',
			trying: false};
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.isOpened = this.isOpened.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.onCepChange = this.onCepChange.bind(this);
		this.changeTab = this.changeTab.bind(this);
		this.handleChangeInfo = this.handleChangeInfo.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
	}

	handleDialogClose() {
		if (!this.state.trying)
			this.props.history.push(this.props.lastPage);
	}

	isOpened() {
		let dialogWasOpen = this.state.dialogOpen;
		this.state.dialogOpen = false;
		for (let i=0; i<this.pageReg.length; i++)
			if (this.pageReg[i].test(this.props.location.pathname)) {
				this.state.dialogOpen = true;
				this.state.tab = i;
				break;
			}
		if (!dialogWasOpen && this.state.dialogOpen) {
			if (!this.state.trying) {
				this.state.editing = false;
				this.state.errorInput = '';
			}
		}
	}

	changeTab(e, newValue) {
		this.state.editing = false;
		this.state.errorInput = '';
		switch(newValue) {
			case 0:
				this.props.history.push('/perfil');
			break;
			case 1:
				this.props.history.push('/perfil/endereco');
			break;
			case 2:
				this.props.history.push('/perfil/acesso');
			break;
			case 3:
				this.props.history.push('/perfil/recuperacao');
			break;
			case 4:
				this.props.history.push('/perfil/notificacoes');
			break;
		}
	}

	handleSubmit(e) {
		if (e != undefined)
			e.preventDefault();
		if (!this.state.editing)
			return;
		switch(this.state.tab) {
			case 0:
				let birthday_date =  (this.state.birthday != null) ? new Date(this.state.birthday) : null;
				fetch(Config.apiURL + "customers/me/personal-info", {
					method: "PATCH",
					body: JSON.stringify({
						name: this.state.name,
						desired_name: this.state.desired_name,
						birthday_day: (birthday_date != null) ? birthday_date.getDate() : -1,
						birthday_month: (birthday_date != null) ? birthday_date.getMonth() : -1,
						birthday_year: (birthday_date != null) ? birthday_date.getFullYear() : -1,
						mobile: this.state.mobile.replace(/[^0-9]/g, ''),
						whatsapp: this.state.whatsapp.replace(/[^0-9]/g, ''),
					}),
					headers: { 
						"Content-type": "application/json; charset=UTF-8",
						"x-customer-token": this.props.customerToken,
					} 
				})
				.then((resp) => {
					resp.json().then((data) => {
						if ('error' in data) {
							let input = '', message = '';
							switch(data.error) {
								case 'name too short':
									input = 'name';
									message = 'Muito curto'
								break;
								case 'name too long':
									input = 'name';
									message = 'Muito longo'
								break;
								case 'desired_name too short':
									input = 'desired_name';
									message = 'Muito curto'
								break;
								case 'desired_name too long':
									input = 'desired_name';
									message = 'Muito longo'
								break;
								case 'birthday invalid':
									input = 'birthday';
									message = 'Data inválida'
								break;
								case 'mobile invalid':
									input = 'mobile';
									message = 'Número inválido'
								break;
								case 'whatsapp invalid':
									input = 'whatsapp';
									message = 'Número inválido'
								break;
								default:
									input = 'personal_unexpected';
									message = 'Erro inesperado: '+data.error;
								break;
							}
							this.setState({trying: false, errorInput: input, errorMessage: message});
						}
						else {
							this.setState({trying: false, errorInput: '', editing: false, errorInput: 'personal_success', errorMessage: 'Informações atualizadas com sucesso!'});
							this.props.getCustomerInfo();
						}
					})
				})
				.catch((e) => {
					setTimeout(this.handleSubmit, 5000);
					console.log(e);
				});
			break;
			case 1:
				fetch(Config.apiURL + "customers/me/address", {
					method: "PATCH",
					body: JSON.stringify({
						cep: this.state.cep.replace(/[^0-9]/g, ''),
						district_id: (this.state.district != null) ? this.state.district.id : -1,
						street: this.state.street,
						number: this.state.number,
						complement: this.state.complement,
						address_observation: this.state.address_observation,
					}),
					headers: { 
						"Content-type": "application/json; charset=UTF-8",
						"x-customer-token": this.props.customerToken,
					} 
				})
				.then((resp) => {
					resp.json().then((data) => {
						if ('error' in data) {
							let input = '', message = '';
							switch(data.error) {
								case 'cep invalid':
									input = 'cep';
									message = 'CEP inválido'
								break;
								case 'district invalid':
									input = 'district';
									message = 'Bairro inválido'
								break;
								case 'street too short':
									input = 'street';
									message = 'Muito curto'
								break;
								case 'street too long':
									input = 'street';
									message = 'Muito longo'
								break;
								case 'number too short':
									input = 'number';
									message = 'Muito curto'
								break;
								case 'number too long':
									input = 'number';
									message = 'Muito longo'
								break;
								case 'complement too long':
									input = 'complement';
									message = 'Muito longo'
								break;
								case 'address_observation too short':
									input = 'address_observation';
									message = 'Muito curto'
								break;
								case 'address_observation too long':
									input = 'address_observation';
									message = 'Muito longo'
								break;
								default:
									input = 'address_unexpected';
									message = 'Erro inesperado: '+data.error;
								break;
							}
							this.setState({trying: false, errorInput: input, errorMessage: message});
						}
						else {
							this.setState({trying: false, errorInput: '', editing: false, errorInput: 'address_success', errorMessage: 'Endereço atualizado com sucesso!'});
							this.props.getCustomerInfo();
						}
					})
				})
				.catch((e) => {
					setTimeout(this.handleSubmit, 5000);
					console.log(e);
				});
			break;
			case 2:
				fetch(Config.apiURL + "customers/me/update-password", {
					method: "POST",
					body: JSON.stringify({
						password: this.state.password,
						new_password: this.state.new_password,
						new_password_confirm: this.state.new_password_confirm,
					}),
					headers: { 
						"Content-type": "application/json; charset=UTF-8",
						"x-customer-token": this.props.customerToken,
					} 
				})
				.then((resp) => {
					resp.json().then((data) => {
						if ('error' in data) {
							let input = '', message = '';
							switch(data.error) {
								case 'password too short':
									input = 'password';
									message = 'Senha muito curta (min. 8)'
								break;
								case 'password too long':
									input = 'password';
									message = 'Senha muito longa (max. 15)'
								break;
								case 'password invalid':
									input = 'password';
									message = 'Senha inválida (somente números/letras/@_)'
								break;
								case 'password incorrect':
									input = 'password';
									message = 'Senha incorreta'
								break;
								case 'new_password too short':
									input = 'new_password';
									message = 'Senha muito curta (min. 8)'
								break;
								case 'new_password too long':
									input = 'new_password';
									message = 'Senha muito longa (max. 15)'
								break;
								case 'new_password invalid':
									input = 'new_password';
									message = 'Senha inválida (somente números/letras/@_)'
								break;
								case 'new_password_confirm not match':
									input = 'new_password_confirm';
									message = 'As senhas não conferem'
								break;
								default:
									input = 'access_unexpected';
									message = 'Erro inesperado: '+data.error;
								break;
							}
							this.setState({trying: false, errorInput: input, errorMessage: message});
						}
						else {
							this.setState({trying: false, errorInput: '', editing: false, errorInput: 'access_success', errorMessage: 'Senha alterada com sucesso!'});
							this.props.getCustomerInfo();
						}
					})
				})
				.catch((e) => {
					setTimeout(this.handleSubmit, 5000);
					console.log(e);
				});
			break;
			case 3:
				fetch(Config.apiURL + "customers/me/update-recover", {
					method: "POST",
					body: JSON.stringify({
						secret_question_id: (this.state.secret_question != null) ? this.state.secret_question.id : -1,
						secret_answer: this.state.secret_answer,
					}),
					headers: { 
						"Content-type": "application/json; charset=UTF-8",
						"x-customer-token": this.props.customerToken,
					} 
				})
				.then((resp) => {
					resp.json().then((data) => {
						if ('error' in data) {
							let input = '', message = '';
							switch(data.error) {
								case 'secret_question invalid':
									input = 'secret_question';
									message = 'Pergunta inválida'
								break;
								case 'secret_answer too short':
									input = 'secret_answer';
									message = 'Segredo muito curto (min. 5)'
								break;
								case 'secret_answer too long':
									input = 'secret_answer';
									message = 'Segredo muito longo (max. 15)'
								break;
								case 'secret_answer invalid':
									input = 'secret_answer';
									message = 'Segredo inválido (somente números/letras/espaços/@_)'
								break;
								default:
									input = 'recover_unexpected';
									message = 'Erro inesperado: '+data.error;
								break;
							}
							this.setState({trying: false, errorInput: input, errorMessage: message});
						}
						else {
							this.setState({trying: false, errorInput: '', editing: false, errorInput: 'recover_success', errorMessage: 'Segredos alterados com sucesso!'});
							this.props.getCustomerInfo();
						}
					})
				})
				.catch((e) => {
					setTimeout(this.handleSubmit, 5000);
					console.log(e);
				});
			break;
			case 4:
				fetch(Config.apiURL + "customers/me/update-notification", {
					method: "POST",
					body: JSON.stringify({
						allow_email: this.state.allow_email,
						allow_whatsapp: this.state.allow_whatsapp,
					}),
					headers: { 
						"Content-type": "application/json; charset=UTF-8",
						"x-customer-token": this.props.customerToken,
					} 
				})
				.then((resp) => {
					resp.json().then((data) => {
						if ('error' in data) {
							let input = '', message = '';
							switch(data.error) {
								default:
									input = 'notification_unexpected';
									message = 'Erro inesperado: '+data.error;
								break;
							}
							this.setState({trying: false, errorInput: input, errorMessage: message});
						}
						else {
							this.setState({trying: false, errorInput: '', editing: false, errorInput: 'notification_success', errorMessage: 'Notificações alteradas com sucesso!'});
							this.props.getCustomerInfo();
						}
					})
				})
				.catch((e) => {
					setTimeout(this.handleSubmit, 5000);
					console.log(e);
				});
			break;
		}
		this.setState({trying: true});
	}

	handleCancel() {
		this.setState({editing: false, errorInput: ''});
	}

	onCepChange(e) {
		let cepNumber = e.target.value.replace(/[^0-9]/g, '');
		if (cepNumber.length == 8 && Object.keys(this.props.districts).length !== 0) {
			fetch(`https://viacep.com.br/ws/${cepNumber}/json/`, {
				method: "GET",
			})
			.then((resp) => {
				resp.json().then((data) => {
					if (!('error' in data)) {
						let district = null;
						for (let i=0; i<this.props.districts.length; i++)
							if (this.props.districts[i].api_name == data.bairro) {
								district = this.props.districts[i];
								break;
							}
						this.setState({street: data.logradouro, complement: data.complemento, district: district});
					}
				})
			})
			.catch((e) => {
				console.log(e);
			});
		}
		this.setState({cep: e.target.value})
	}

	handleChangeInfo() {
		switch(this.state.tab) {
			case 0:
				this.setState({
					editing: true,
					errorInput: '',
					name: this.props.customerInfo.name,
					desired_name: this.props.customerInfo.desired_name,
					birthday: this.props.customerInfo.birthday,
					mobile: this.props.customerInfo.mobile,
					whatsapp: this.props.customerInfo.whatsapp,
				});
			break;
			case 1:
				this.setState({
					editing: true,
					errorInput: '',
					cep: this.props.customerInfo.cep,
					district: this.props.districtsById[this.props.customerInfo.district_id],
					street: this.props.customerInfo.street,
					number: this.props.customerInfo.number,
					complement: this.props.customerInfo.complement,
					address_observation: this.props.customerInfo.address_observation,
				});
			break;
			case 2:
				this.setState({
					editing: true,
					errorInput: '',
					password: '',
					new_password: '',
					new_password_confirm: '',
				});
			break;
			case 3:
				this.setState({
					editing: true,
					errorInput: '',
					secret_question: this.props.secretQuestionsById[this.props.customerInfo.secret_question_id],
					secret_answer: '',
				});
			break;
			case 4:
				this.setState({
					editing: true,
					errorInput: '',
					allow_email: this.props.customerInfo.allow_email,
					allow_whatsapp: this.props.customerInfo.allow_whatsapp,
				});
			break;
		}
	}

	render() {
		const { classes } = this.props;

		this.isOpened();

		let customerInfoLoaded = !(Object.keys(this.props.customerInfo).length === 0);
		let citiesLoaded = !(Object.keys(this.props.citiesById).length === 0);
		let districtsLoaded = !(this.props.districts.length === 0);
		let secretQuestionsLoaded = !(this.props.secretQuestions.length === 0);

		return <React.Fragment>
			<Dialog fullScreen open={this.state.dialogOpen} onClose={this.handleDialogClose} TransitionComponent={Transition}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose} className={classes.dialogTitle}>
					<Tabs
						value={this.state.tab}
						indicatorColor="primary"
						textColor="primary"
						onChange={this.changeTab}
						selectionFollowsFocus
						variant="scrollable"
          				scrollButtons="on"
					>
						<Tab label="Informações Pessoais" disabled={this.state.trying}/>
						<Tab label="Endereço de Entrega" disabled={this.state.trying}/>
						<Tab label="Dados de Acesso" disabled={this.state.trying}/>
						<Tab label="Recuperação de Conta" disabled={this.state.trying}/>
						<Tab label="Notificações" disabled={this.state.trying}/>
					</Tabs>
				</DialogTitle>
				<DialogContent dividers ref={this.contentRef}>
					{(customerInfoLoaded) ? <React.Fragment>
						{(this.state.tab == 0) ? <div>
							<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
								<Grid container spacing={1}>
									<Grid item xs={6}>
										<TextField
											required
											readOnly={!this.state.editing}
											onChange={(e) => this.setState({name: e.target.value})}
											fullWidth
											margin="normal"
											id="name"
											label="Nome Completo"
											value={(!this.state.editing) ? this.props.customerInfo.name : this.state.name}
											disabled={this.state.trying}
											error={this.state.errorInput == 'name'}
											helperText={(this.state.errorInput == 'name') ? this.state.errorMessage : ''}
											InputProps={{
												inputProps: {
													maxLength: 50
												}
											}}
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											required
											readOnly={!this.state.editing}
											onChange={(e) => this.setState({desired_name: e.target.value})}
											fullWidth
											margin="normal"
											id="desired_name"
											label="Desejo ser tratada(o) como"
											value={(!this.state.editing) ? this.props.customerInfo.desired_name : this.state.desired_name}
											disabled={this.state.trying}
											error={this.state.errorInput == 'desired_name'}
											helperText={(this.state.errorInput == 'desired_name') ? this.state.errorMessage : ''}
											InputProps={{
												inputProps: {
													maxLength: 20
												}
											}}
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											required
											readOnly
											fullWidth
											margin="normal"
											id="cpf"
											label="CPF"
											value={this.props.customerInfo.cpf}
											disabled
											InputProps={{
												inputComponent: CPFMaskCustom,
											}}
										/>
									</Grid>
									<Grid item xs={6}>
										<KeyboardDatePicker
											clearable
											required
											fullWidth
											margin="normal"
											label="Data de Nascimento"
											value={(!this.state.editing) ? this.props.customerInfo.birthday : this.state.birthday}
											placeholder="10/10/2018"
											onChange={(e) => this.setState({birthday: e})}
											minDate={new Date(1900, 1, 1)}
											format="DD/MM/YYYY"
											disableFuture
											disabled={this.state.trying || !this.state.editing}
											error={this.state.errorInput == 'birthday'}
											helperText={(this.state.errorInput == 'birthday') ? this.state.errorMessage : ''}
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											required
											readOnly={!this.state.editing}
											fullWidth
											onChange={(e) => this.setState({mobile: e.target.value})}
											margin="normal"
											id="mobile"
											label="Telefone"
											value={(!this.state.editing) ? this.props.customerInfo.mobile : this.state.mobile}
											disabled={this.state.trying}
											error={this.state.errorInput == 'mobile'}
											helperText={(this.state.errorInput == 'mobile') ? this.state.errorMessage : ''}
											placeholder="(62) 90000-0000"
											InputProps={{
												inputComponent: NumberMaskCustom,
											}}
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											readOnly={!this.state.editing}
											fullWidth
											onChange={(e) => this.setState({whatsapp: e.target.value})}
											margin="normal"
											id="whatsapp"
											label="Whatsapp"
											value={(!this.state.editing) ? this.props.customerInfo.whatsapp : this.state.whatsapp}
											disabled={this.state.trying}
											error={this.state.errorInput == 'whatsapp'}
											helperText={(this.state.errorInput == 'whatsapp') ? this.state.errorMessage : ''}
											placeholder="(62) 90000-0000"
											InputProps={{
												inputComponent: NumberMaskCustom,
											}}
										/>
									</Grid>
									{(this.state.errorInput == 'personal_unexpected') ?
									<Grid item xs={12}>
										<Alert severity="error">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
									{(this.state.errorInput == 'personal_success') ?
									<Grid item xs={12}>
										<Alert severity="success">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
								</Grid>
								<input type="submit" style={{display: 'none'}}/>
							</form>
						</div> : ''}
						{(this.state.tab == 1) ? <div>
							<form action="#" onSubmit={this.handleSubmit}>
								<Grid container spacing={1}>
									<Grid item xs={6}>
										<TextField
											readOnly={!this.state.editing}
											fullWidth
											required
											onChange={this.onCepChange}
											margin="normal"
											id="cep"
											label="CEP"
											value={(!this.state.editing) ? this.props.customerInfo.cep : this.state.cep}
											disabled={this.state.trying}
											error={this.state.errorInput == 'cep'}
											helperText={(this.state.errorInput == 'cep') ? this.state.errorMessage : ''}
											placeholder="00000-000"
											InputProps={{
												inputComponent: CEPMaskCustom,
											}}
										/>
									</Grid>
									<Grid item xs={6} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
										{(citiesLoaded && districtsLoaded) ?
											<Autocomplete
												id="district"
												fullWidth
												value={(!this.state.editing) ? this.props.districtsById[this.props.customerInfo.district_id] : this.state.district}
												onChange={(e, newValue) => this.setState({district: newValue})}
												options={this.props.districts}
												getOptionLabel={(district) => `${district.name} - ${this.props.citiesById[district.city_id].name}/${this.props.citiesById[district.city_id].uf}`}
												disabled={this.state.trying || !this.state.editing}
												renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'district'} helperText={(this.state.errorInput == 'district') ? this.state.errorMessage : ''} required margin="normal" label="Bairro" />}
											/>
											: <CircularProgress color="primary"/>}
									</Grid>
									<Grid item xs={6}>
										<TextField
											readOnly={!this.state.editing}
											required
											fullWidth
											onChange={(e) => this.setState({street: e.target.value})}
											margin="normal"
											id="street"
											label="Logradouro"
											value={(!this.state.editing) ? this.props.customerInfo.street : this.state.street}
											disabled={this.state.trying}
											error={this.state.errorInput == 'street'}
											helperText={(this.state.errorInput == 'street') ? this.state.errorMessage : ''}
											InputProps={{
												inputProps: {
													maxLength: 30
												}
											}}
											placeholder="Rua 123"
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											readOnly={!this.state.editing}
											required
											fullWidth
											onChange={(e) => this.setState({number: e.target.value})}
											margin="normal"
											id="number"
											label="Número"
											value={(!this.state.editing) ? this.props.customerInfo.number : this.state.number}
											disabled={this.state.trying}
											error={this.state.errorInput == 'number'}
											helperText={(this.state.errorInput == 'number') ? this.state.errorMessage : ''}
											InputProps={{
												inputProps: {
													maxLength: 10
												}
											}}
											placeholder="456"
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											readOnly={!this.state.editing}
											fullWidth
											onChange={(e) => this.setState({complement: e.target.value})}
											margin="normal"
											id="complement"
											label="Complemento"
											value={(!this.state.editing) ? this.props.customerInfo.complement : this.state.complement}
											disabled={this.state.trying}
											error={this.state.errorInput == 'complement'}
											helperText={(this.state.errorInput == 'complement') ? this.state.errorMessage : ''}
											InputProps={{
												inputProps: {
													maxLength: 30
												}
											}}
											placeholder="Quadra 7 Lote 8..."
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											readOnly={!this.state.editing}
											fullWidth
											onChange={(e) => this.setState({address_observation: e.target.value})}
											margin="normal"
											id="address_observation"
											label="Observação"
											value={(!this.state.editing) ? this.props.customerInfo.address_observation : this.state.address_observation}
											disabled={this.state.trying}
											error={this.state.errorInput == 'address_observation'}
											helperText={(this.state.errorInput == 'address_observation') ? this.state.errorMessage : ''}
											InputProps={{
												inputProps: {
													maxLength: 50
												}
											}}
											placeholder="Deixar com o porteiro..."
										/>
									</Grid>
									{(this.state.errorInput == 'address_unexpected') ?
									<Grid item xs={12}>
										<Alert severity="error">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
									{(this.state.errorInput == 'address_success') ?
									<Grid item xs={12}>
										<Alert severity="success">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
								</Grid>
								<input type="submit" style={{display: 'none'}}/>
							</form>
						</div> : ''}
						{(this.state.tab == 2) ? <div>
							<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
								<Grid container spacing={1}>
									<Grid item xs={12}>
										<TextField
											readOnly
											required
											fullWidth
											margin="normal"
											id="email"
											label="E-mail"
											value={this.props.customerInfo.email}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<AccountCircle />
													</InputAdornment>
												),
												inputProps: {
													maxLength: 254
												}
											}}
											disabled
										/>
									</Grid>
									{(this.state.editing) ? <React.Fragment>
										<Grid item xs={6}>
											<TextField
												required
												fullWidth
												onChange={(e) => this.setState({password: e.target.value})}
												margin="normal"
												type="password"
												id="password"
												label="Senha Atual"
												value={this.state.password}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<LockIcon />
														</InputAdornment>
													),
													inputProps: {
														maxLength: 15
													}
												}}
												disabled={this.state.trying}
												error={this.state.errorInput == 'password'}
												helperText={(this.state.errorInput == 'password') ? this.state.errorMessage : ''}
											/>
										</Grid>
										<Grid item xs={6}></Grid>
										<Grid item xs={6}>
											<TextField
												required
												fullWidth
												onChange={(e) => this.setState({new_password: e.target.value})}
												margin="normal"
												type="password"
												id="new_password"
												label="Nova Senha"
												value={this.state.new_password}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<LockIcon />
														</InputAdornment>
													),
													inputProps: {
														maxLength: 15
													}
												}}
												disabled={this.state.trying}
												error={this.state.errorInput == 'new_password'}
												helperText={(this.state.errorInput == 'new_password') ? this.state.errorMessage : ''}
												autoComplete="new-password"
											/>
										</Grid>
										<Grid item xs={6}>
											<TextField
												required
												fullWidth
												onChange={(e) => this.setState({new_password_confirm: e.target.value})}
												margin="normal"
												type="password"
												id="new_password_confirm"
												label="Confirmação de Senha"
												value={this.state.new_password_confirm}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<LockIcon />
														</InputAdornment>
													),
													inputProps: {
														maxLength: 15
													}
												}}
												disabled={this.state.trying}
												error={this.state.errorInput == 'new_password_confirm'}
												helperText={(this.state.errorInput == 'new_password_confirm') ? this.state.errorMessage : ''}
												autoComplete="new-password"
											/>
										</Grid>
									</React.Fragment> : ''}
									{(this.state.errorInput == 'access_unexpected') ?
									<Grid item xs={12}>
										<Alert severity="error">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
									{(this.state.errorInput == 'access_success') ?
									<Grid item xs={12}>
										<Alert severity="success">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
								</Grid>
								<input type="submit" style={{display: 'none'}}/>
							</form>
						</div> : ''}
						{(this.state.tab == 3) ? <div>
							<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
								<Grid container spacing={1}>
									<Grid item xs={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
										{(secretQuestionsLoaded) ?
											<Autocomplete
												id="secret_question"
												fullWidth
												value={(!this.state.editing) ? this.props.secretQuestionsById[this.props.customerInfo.secret_question_id] : this.state.secret_question}
												onChange={(e, newValue) => this.setState({secret_question: newValue})}
												options={this.props.secretQuestions}
												getOptionLabel={(secretQuestion) => secretQuestion.question}
												disabled={this.state.trying || !this.state.editing}
												renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'secret_question'} helperText={(this.state.errorInput == 'secret_question') ? this.state.errorMessage : ''} required margin="normal" label="Pergunta Secreta" />}
											/>
											: <CircularProgress color="primary"/>}
									</Grid>
									<Grid item xs={12}>
										<TextField
											readOnly={!this.state.editing}
											required
											fullWidth
											onChange={(e) => this.setState({secret_answer: e.target.value})}
											margin="normal"
											id="secret_answer"
											label="Resposta Secreta"
											value={(!this.state.editing) ? '********' : this.state.secret_answer}
											disabled={this.state.trying}
											error={this.state.errorInput == 'secret_answer'}
											helperText={(this.state.errorInput == 'secret_answer') ? this.state.errorMessage : ''}
											InputProps={{
												inputProps: {
													maxLength: 15
												}
											}}
											placeholder=""
										/>
									</Grid>
									{(this.state.errorInput == 'recover_unexpected') ?
									<Grid item xs={12}>
										<Alert severity="error">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
									{(this.state.errorInput == 'recover_success') ?
									<Grid item xs={12}>
										<Alert severity="success">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
								</Grid>
								<input type="submit" style={{display: 'none'}}/>
							</form>
						</div> : ''}
						{(this.state.tab == 4) ? <div>
							<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
								<Grid container spacing={1}>
									<Grid item xs={12}>
										<FormControlLabel
											onChange={(e, newValue) => this.setState({allow_email: newValue})}
											control={<Checkbox color="primary" checked={(!this.state.editing) ? this.props.customerInfo.allow_email : this.state.allow_email} />}
											label="Aceito receber promoções e avisos por E-mail"
											labelPlacement="start"
											disabled={this.state.trying || !this.state.editing}
										/>
									</Grid>
									<Grid item xs={12}>
										<FormControlLabel
											onChange={(e, newValue) => this.setState({allow_whatsapp: newValue})}
											control={<Checkbox color="primary" checked={(!this.state.editing) ? this.props.customerInfo.allow_whatsapp : this.state.allow_whatsapp}/>}
											label="Aceito receber promoções e avisos pelo Whatsapp"
											labelPlacement="start"
											disabled={this.state.trying || !this.state.editing}
										/>
									</Grid>
									{(this.state.errorInput == 'notification_unexpected') ?
									<Grid item xs={12}>
										<Alert severity="error">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
									{(this.state.errorInput == 'notification_success') ?
									<Grid item xs={12}>
										<Alert severity="success">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
								</Grid>
								<input type="submit" style={{display: 'none'}}/>
							</form>
						</div> : ''}
						{(!this.state.editing) ? <Button onClick={this.handleChangeInfo} disabled={this.state.trying}>
							{(this.state.tab == 0) ? 'Atualizar Informações' :
							(this.state.tab == 1) ? 'Atualizar Endereço' :
							(this.state.tab == 2) ? 'Alterar Senha' :
							(this.state.tab == 3) ? 'Alterar Segredos' :
							'Alterar Notificações'}
						</Button> :
						<React.Fragment>
							<Button onClick={this.handleCancel} disabled={this.state.trying}>
								Cancelar
							</Button>
							<Button onClick={this.handleSubmit} disabled={this.state.trying} color="primary">
								Salvar
							</Button>
						</React.Fragment>}
					</React.Fragment> : ''}
					{(!customerInfoLoaded) ? <div className={classes.progressArea}><CircularProgress color="primary"/></div> : ''}
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleDialogClose} disabled={this.state.trying}>
						Fechar
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(ProfileDialog)