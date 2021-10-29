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

class LoginDialog extends React.Component {

	constructor(props) {
		super(props);
		this.pageReg = [];
		this.pageReg[0] = new RegExp('(^\/entrar)', '');
		this.pageReg[1] = new RegExp('(^\/cadastrar)', '');
		this.pageReg[2] = new RegExp('(^\/esqueci-minha-senha)', '');
		this.state = {dialogOpen: false, tab: 0,
			login: '', password: '',
			r_name: '', r_desired_name: '', r_cpf: '', r_birthday: null,
			r_mobile: '', r_whatsapp: '',
			r_cep: '', r_district: null, r_street: '', r_number: '', r_complement: '', r_address_observation: '',
			r_email: '', r_password: '', r_password_confirm: '', 
			r_secret_question: null, r_secret_answer: '',
			r_agree: false, r_allow_email: true, r_allow_whatsapp: true,
			f_cpf: '',
			f_birthday: null,
			f_secret_question: null, f_secret_answer: '',
			f_password: '', f_password_confirm: '', 
			errorInput: '', errorMessage: '',
			trying: false};
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.isOpened = this.isOpened.bind(this);
		this.changeTab = this.changeTab.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.onRNameChange = this.onRNameChange.bind(this);
		this.onRCepChange = this.onRCepChange.bind(this);
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
			this.state.errorInput = '';
			this.state.login = ''; this.state.password = '';
			this.state.r_name = ''; this.state.r_desired_name = ''; this.state.r_cpf = ''; this.state.r_birthday = null;
			this.state.r_mobile = ''; this.state.r_whatsapp = '';
			this.state.r_cep = ''; this.state.r_district = null; this.state.r_street = ''; this.state.r_number = ''; this.state.r_complement = ''; this.state.r_address_observation = '';
			this.state.r_email = ''; this.state.r_password = ''; this.state.r_password_confirm = ''; 
			this.state.r_secret_question = null; this.state.r_secret_answer = '';
			this.state.r_agree = false; this.state.r_allow_email = true; this.state.r_allow_whatsapp = true;
			this.state.f_cpf = '';
			this.state.f_birthday = null;
			this.state.f_secret_question = null; this.state.f_secret_answer = '';
			this.state.f_password = ''; this.state.f_password_confirm = ''; 
			this.state.errorInput = ''; this.state.errorMessage = '';
		}
		if (this.state.dialogOpen && this.props.auth)
			this.handleDialogClose();
	}

	changeTab(e, newValue) {
		if (newValue == 0)
			this.props.history.push('/entrar');
		else
			this.props.history.push('/cadastrar');
		//this.setState({tab: newValue});
	}

	handleSubmit(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({trying: true});
		if (this.state.tab == 0) {
			fetch(Config.apiURL + "customers/login", {
				method: "POST",
				body: JSON.stringify({login: this.state.login, password: this.state.password}),
				headers: { 
					"Content-type": "application/json; charset=UTF-8",
				} 
			})
			.then((resp) => {
				resp.json().then((data) => {
					if ('error' in data) {
						let input = '', message = '';
						switch(data.error) {
							case 'incorrectLogin':
								input = 'login';
								message = 'CPF ou E-mail inválidos'
							break;
							case 'incorrectPassword':
								input = 'password';
								message = 'Senha inválida'
							break;
						}
						this.setState({trying: false, errorInput: input, errorMessage: message});
					}
					else {
						this.setState({trying: false, errorInput: ''});
						this.props.customerLogin(data.customerToken);
					}
				})
			})
			.catch((e) => {
				setTimeout(this.handleSubmit, 5000);
				console.log(e);
			});
		} else if (this.state.tab == 1) {
			let birthday_date =  (this.state.r_birthday != null) ? new Date(this.state.r_birthday) : null;
			fetch(Config.apiURL + "customers/register", {
				method: "POST",
				body: JSON.stringify({
					name: this.state.r_name,
					desired_name: this.state.r_desired_name,
					cpf: this.state.r_cpf.replace(/[^0-9]/g, ''),
					birthday_day: (birthday_date != null) ? birthday_date.getDate() : -1,
					birthday_month: (birthday_date != null) ? birthday_date.getMonth() : -1,
					birthday_year: (birthday_date != null) ? birthday_date.getFullYear() : -1,
					mobile: this.state.r_mobile.replace(/[^0-9]/g, ''),
					whatsapp: this.state.r_whatsapp.replace(/[^0-9]/g, ''),
					cep: this.state.r_cep.replace(/[^0-9]/g, ''),
					district_id: (this.state.r_district != null) ? this.state.r_district.id : -1,
					street: this.state.r_street,
					number: this.state.r_number,
					complement: this.state.r_complement,
					address_observation: this.state.r_address_observation,
					email: this.state.r_email,
					password: this.state.r_password,
					password_confirm: this.state.r_password_confirm,
					secret_question_id: (this.state.r_secret_question != null) ? this.state.r_secret_question.id : -1,
					secret_answer: this.state.r_secret_answer,
					agree: this.state.r_agree,
					allow_email: this.state.r_allow_email,
					allow_whatsapp: this.state.r_allow_whatsapp,
					consultant_code: this.props.consultant_code,
				}),
				headers: { 
					"Content-type": "application/json; charset=UTF-8",
				} 
			})
			.then((resp) => {
				resp.json().then((data) => {
					if ('error' in data) {
						let input = '', message = '';
						switch(data.error) {
							case 'name too short':
								input = 'r_name';
								message = 'Muito curto'
							break;
							case 'name too long':
								input = 'r_name';
								message = 'Muito longo'
							break;
							case 'desired_name too short':
								input = 'r_desired_name';
								message = 'Muito curto'
							break;
							case 'desired_name too long':
								input = 'r_desired_name';
								message = 'Muito longo'
							break;
							case 'cpf invalid':
								input = 'r_cpf';
								message = 'CPF inválido'
							break;
							case 'birthday invalid':
								input = 'r_birthday';
								message = 'Data inválida'
							break;
							case 'mobile invalid':
								input = 'r_mobile';
								message = 'Número inválido'
							break;
							case 'whatsapp invalid':
								input = 'r_whatsapp';
								message = 'Número inválido'
							break;
							case 'cep invalid':
								input = 'r_cep';
								message = 'CEP inválido'
							break;
							case 'district invalid':
								input = 'r_district';
								message = 'Bairro inválido'
							break;
							case 'street too short':
								input = 'r_street';
								message = 'Muito curto'
							break;
							case 'street too long':
								input = 'r_street';
								message = 'Muito longo'
							break;
							case 'number too short':
								input = 'r_number';
								message = 'Muito curto'
							break;
							case 'number too long':
								input = 'r_number';
								message = 'Muito longo'
							break;
							case 'complement too long':
								input = 'r_complement';
								message = 'Muito longo'
							break;
							case 'address_observation too short':
								input = 'r_address_observation';
								message = 'Muito curto'
							break;
							case 'address_observation too long':
								input = 'r_address_observation';
								message = 'Muito longo'
							break;
							case 'email invalid':
								input = 'r_email';
								message = 'Email inválido'
							break;
							case 'password too short':
								input = 'r_password';
								message = 'Senha muito curta (min. 8)'
							break;
							case 'password too long':
								input = 'r_password';
								message = 'Senha muito longa (max. 15)'
							break;
							case 'password invalid':
								input = 'r_password';
								message = 'Senha inválida (somente números/letras/@_)'
							break;
							case 'password_confirm not match':
								input = 'r_password_confirm';
								message = 'As senhas não conferem'
							break;
							case 'secret_question invalid':
								input = 'r_secret_question';
								message = 'Pergunta inválida'
							break;
							case 'secret_answer too short':
								input = 'r_secret_answer';
								message = 'Segredo muito curto (min. 5)'
							break;
							case 'secret_answer too long':
								input = 'r_secret_answer';
								message = 'Segredo muito longo (max. 15)'
							break;
							case 'secret_answer invalid':
								input = 'r_secret_answer';
								message = 'Segredo inválido (somente números/letras/espaços/@_)'
							break;
							case 'agree required':
								input = 'r_agree';
								message = 'Necessário concordar com os Termos de Uso'
							break;
							case 'email duplicate':
								input = 'r_email';
								message = 'Email já cadastrado';
							break;
							case 'cpf duplicate':
								input = 'r_cpf';
								message = 'CPF já cadastrado';
							break;
							default:
								input = 'r_unexpected';
								message = 'Erro inesperado: '+data.error;
						}
						this.setState({trying: false, errorInput: input, errorMessage: message});
					}
					else {
						this.setState({trying: false, errorInput: ''});
						this.props.customerLogin(data.customerToken);
					}
				})
			})
			.catch((e) => {
				setTimeout(this.handleSubmit, 5000);
				console.log(e);
			});
		} else if (this.state.tab == 2) {
			let birthday_date =  (this.state.f_birthday != null) ? new Date(this.state.f_birthday) : null;
			fetch(Config.apiURL + "customers/reset-password", {
				method: "POST",
				body: JSON.stringify({
					cpf: this.state.f_cpf.replace(/[^0-9]/g, ''),
					birthday_day: (birthday_date != null) ? birthday_date.getDate() : -1,
					birthday_month: (birthday_date != null) ? birthday_date.getMonth() : -1,
					birthday_year: (birthday_date != null) ? birthday_date.getFullYear() : -1,
					password: this.state.f_password,
					password_confirm: this.state.f_password_confirm,
					secret_question_id: (this.state.f_secret_question != null) ? this.state.f_secret_question.id : -1,
					secret_answer: this.state.f_secret_answer,
				}),
				headers: { 
					"Content-type": "application/json; charset=UTF-8",
				} 
			})
			.then((resp) => {
				resp.json().then((data) => {
					if ('error' in data) {
						let input = '', message = '';
						switch(data.error) {
							case 'cpf invalid':
								input = 'f_cpf';
								message = 'CPF inválido'
							break;
							case 'birthday invalid':
								input = 'f_birthday';
								message = 'Data inválida'
							break;
							case 'password too short':
								input = 'f_password';
								message = 'Senha muito curta (min. 8)'
							break;
							case 'password too long':
								input = 'f_password';
								message = 'Senha muito longa (max. 15)'
							break;
							case 'password invalid':
								input = 'f_password';
								message = 'Senha inválida (somente números/letras/@_)'
							break;
							case 'password_confirm not match':
								input = 'f_password_confirm';
								message = 'As senhas não conferem'
							break;
							case 'secret_question invalid':
								input = 'f_secret_question';
								message = 'Pergunta inválida'
							break;
							case 'secret_answer too short':
								input = 'f_secret_answer';
								message = 'Segredo muito curto (min. 5)'
							break;
							case 'secret_answer too long':
								input = 'f_secret_answer';
								message = 'Segredo muito longo (max. 15)'
							break;
							case 'secret_answer invalid':
								input = 'f_secret_answer';
								message = 'Segredo inválido (somente números/letras/espaços/@_)'
							break;
							case 'wrong information':
								input = 'f_error';
								message = 'As informações estão incorretas, ou não existe conta com o CPF informado'
							break;
							default:
								input = 'f_error';
								message = 'Erro inesperado: '+data.error;
						}
						this.setState({trying: false, errorInput: input, errorMessage: message});
					}
					else 
						this.setState({trying: false, errorInput: 'f_success', errorMessage: 'Senha redefinida com sucesso!'});
				})
			})
			.catch((e) => {
				setTimeout(this.handleSubmit, 5000);
				console.log(e);
			});
		}
	}

	onRNameChange(e) {
		if (e.target.value.indexOf(' ') == -1) 
			this.setState({r_name: e.target.value, r_desired_name: e.target.value.substr(0, 20)});
		else
			this.setState({r_name: e.target.value});
	}

	onRCepChange(e) {
		let cepNumber = e.target.value.replace(/[^0-9]/g, '');
		if (cepNumber.length == 8 && Object.keys(this.props.districts).length !== 0) {
			fetch(`https://viacep.com.br/ws/${cepNumber}/json/`, {
				method: "GET",
			})
			.then((resp) => {
				resp.json().then((data) => {
					if (!('error' in data)) {
						let r_district = null;
						for (let i=0; i<this.props.districts.length; i++)
							if (this.props.districts[i].api_name == data.bairro) {
								r_district = this.props.districts[i];
								break;
							}
						this.setState({r_street: data.logradouro, r_complement: data.complemento, r_district: r_district});
					}
				})
			})
			.catch((e) => {
				console.log(e);
			});
		}
		this.setState({r_cep: e.target.value})
	}

	render() {
		const { classes } = this.props;

		this.isOpened();

		let citiesLoaded = !(Object.keys(this.props.citiesById).length === 0);
		let districtsLoaded = !(this.props.districts.length === 0);
		let secretQuestionsLoaded = !(this.props.secretQuestions.length === 0);

		return <React.Fragment>
			<Dialog open={this.state.dialogOpen} onClose={this.handleDialogClose} TransitionComponent={Transition}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose} className={classes.dialogTitle}>
					<Tabs
						value={this.state.tab}
						indicatorColor="primary"
						textColor="primary"
						onChange={this.changeTab}
						selectionFollowsFocus
						centered
					>
						<Tab style={{display: (this.state.tab == 2) ? 'none' : 'inline-flex'}} label="Entrar" disabled={this.state.trying}/>
						<Tab style={{display: (this.state.tab == 2) ? 'none' : 'inline-flex'}} label="Cadastrar" disabled={this.state.trying}/>
						<Tab style={{display: (this.state.tab != 2) ? 'none' : 'inline-flex'}} label="Redefinir Senha" disabled={this.state.trying}/>
					</Tabs>
				</DialogTitle>
				<DialogContent dividers ref={this.contentRef}>
					{(this.state.tab == 0) ? <div>
						<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
							<TextField
								required
								fullWidth
								onChange={(e) => this.setState({login: e.target.value})}
								margin="normal"
								id="login"
								label="CPF ou E-mail"
								value={this.state.login}
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
								disabled={this.state.trying}
								error={this.state.errorInput == 'login'}
								helperText={(this.state.errorInput == 'login') ? this.state.errorMessage : ''}
								autoComplete='username'
							/>
							<TextField
								required
								fullWidth
								onChange={(e) => this.setState({password: e.target.value})}
								margin="normal"
								type="password"
								id="password"
								label="Senha"
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
								autoComplete='password'
							/>
							<input type="submit" style={{display: 'none'}}/>
						</form>
					</div> : ''}
					{(this.state.tab == 1) ? <div>
						<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
						<Grid container spacing={1}>
							<Grid item xs={12}>
								<Typography variant="h6" align="center">
									Informações Pessoais
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<TextField
									required
									fullWidth
									onChange={this.onRNameChange}
									margin="normal"
									id="r_name"
									label="Nome Completo"
									value={this.state.r_name}
									disabled={this.state.trying}
									error={this.state.errorInput == 'r_name'}
									helperText={(this.state.errorInput == 'r_name') ? this.state.errorMessage : ''}
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
									fullWidth
									onChange={(e) => this.setState({r_desired_name: e.target.value})}
									margin="normal"
									id="r_desired_name"
									label="Desejo ser tratada(o) como"
									value={this.state.r_desired_name}
									disabled={this.state.trying}
									error={this.state.errorInput == 'r_desired_name'}
									helperText={(this.state.errorInput == 'r_desired_name') ? this.state.errorMessage : ''}
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
									fullWidth
									onChange={(e) => this.setState({r_cpf: e.target.value})}
									margin="normal"
									id="r_cpf"
									label="CPF"
									value={this.state.r_cpf}
									disabled={this.state.trying}
									error={this.state.errorInput == 'r_cpf'}
									helperText={(this.state.errorInput == 'r_cpf') ? this.state.errorMessage : ''}
									placeholder="000.000.000-00"
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
									value={this.state.r_birthday}
									placeholder="10/10/2018"
									onChange={(e) => this.setState({r_birthday: e})}
									minDate={new Date(1900, 1, 1)}
									format="DD/MM/YYYY"
									disableFuture
									disabled={this.state.trying}
									error={this.state.errorInput == 'r_birthday'}
									helperText={(this.state.errorInput == 'r_birthday') ? this.state.errorMessage : ''}
								/>
							</Grid>
								<Grid item xs={6}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({r_mobile: e.target.value})}
										margin="normal"
										id="r_mobile"
										label="Telefone"
										value={this.state.r_mobile}
										disabled={this.state.trying}
										error={this.state.errorInput == 'r_mobile'}
										helperText={(this.state.errorInput == 'r_mobile') ? this.state.errorMessage : ''}
										placeholder="(62) 90000-0000"
										InputProps={{
											inputComponent: NumberMaskCustom,
										}}
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
										fullWidth
										onChange={(e) => this.setState({r_whatsapp: e.target.value})}
										margin="normal"
										id="r_whatsapp"
										label="Whatsapp"
										value={this.state.r_whatsapp}
										disabled={this.state.trying}
										error={this.state.errorInput == 'r_whatsapp'}
										helperText={(this.state.errorInput == 'r_whatsapp') ? this.state.errorMessage : ''}
										placeholder="(62) 90000-0000"
										InputProps={{
											inputComponent: NumberMaskCustom,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<Typography variant="h6" align="center">
										Endereço de Entrega
									</Typography>
								</Grid>
								<Grid item xs={6}>
									<TextField
										fullWidth
										required
										onChange={this.onRCepChange}
										margin="normal"
										id="r_cep"
										label="CEP"
										value={this.state.r_cep}
										disabled={this.state.trying}
										error={this.state.errorInput == 'r_cep'}
										helperText={(this.state.errorInput == 'r_cep') ? this.state.errorMessage : ''}
										placeholder="00000-000"
										InputProps={{
											inputComponent: CEPMaskCustom,
										}}
									/>
								</Grid>
								<Grid item xs={6} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
									{(citiesLoaded && districtsLoaded) ?
										<Autocomplete
											id="r_district"
											fullWidth
											value={this.state.r_district}
											onChange={(e, newValue) => this.setState({r_district: newValue})}
											options={this.props.districts}
											getOptionLabel={(district) => `${district.name} - ${this.props.citiesById[district.city_id].name}/${this.props.citiesById[district.city_id].uf}`}
											disabled={this.state.trying}
											renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'r_district'} helperText={(this.state.errorInput == 'r_district') ? this.state.errorMessage : ''} required margin="normal" label="Bairro" />}
										/>
										: <CircularProgress color="primary"/>}
								</Grid>
								<Grid item xs={6}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({r_street: e.target.value})}
										margin="normal"
										id="r_street"
										label="Logradouro"
										value={this.state.r_street}
										disabled={this.state.trying}
										error={this.state.errorInput == 'r_street'}
										helperText={(this.state.errorInput == 'r_street') ? this.state.errorMessage : ''}
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
										required
										fullWidth
										onChange={(e) => this.setState({r_number: e.target.value})}
										margin="normal"
										id="r_number"
										label="Número"
										value={this.state.r_number}
										disabled={this.state.trying}
										error={this.state.errorInput == 'r_number'}
										helperText={(this.state.errorInput == 'r_number') ? this.state.errorMessage : ''}
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
										fullWidth
										onChange={(e) => this.setState({r_complement: e.target.value})}
										margin="normal"
										id="r_complement"
										label="Complemento"
										value={this.state.r_complement}
										disabled={this.state.trying}
										error={this.state.errorInput == 'r_complement'}
										helperText={(this.state.errorInput == 'r_complement') ? this.state.errorMessage : ''}
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
										fullWidth
										onChange={(e) => this.setState({r_address_observation: e.target.value})}
										margin="normal"
										id="r_address_observation"
										label="Observação"
										value={this.state.r_address_observation}
										disabled={this.state.trying}
										error={this.state.errorInput == 'r_address_observation'}
										helperText={(this.state.errorInput == 'r_address_observation') ? this.state.errorMessage : ''}
										InputProps={{
											inputProps: {
												maxLength: 50
											}
										}}
										placeholder="Deixar com o porteiro..."
									/>
								</Grid>
								<Grid item xs={12}>
									<Typography variant="h6" align="center">
										Dados de Acesso
									</Typography>
								</Grid>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({r_email: e.target.value})}
										margin="normal"
										id="r_email"
										label="E-mail"
										value={this.state.r_email}
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
										disabled={this.state.trying}
										error={this.state.errorInput == 'r_email'}
										helperText={(this.state.errorInput == 'r_email') ? this.state.errorMessage : ''}
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({r_password: e.target.value})}
										margin="normal"
										type="password"
										id="r_password"
										label="Senha"
										value={this.state.r_password}
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
										error={this.state.errorInput == 'r_password'}
										helperText={(this.state.errorInput == 'r_password') ? this.state.errorMessage : ''}
										autoComplete="new-password"
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({r_password_confirm: e.target.value})}
										margin="normal"
										type="password"
										id="r_password_confirm"
										label="Confirmação de Senha"
										value={this.state.r_password_confirm}
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
										error={this.state.errorInput == 'r_password_confirm'}
										helperText={(this.state.errorInput == 'r_password_confirm') ? this.state.errorMessage : ''}
										autoComplete="new-password"
									/>
								</Grid>
								<Grid item xs={12}>
									<Typography variant="h6" align="center">
										Recuperação de Conta
									</Typography>
								</Grid>
								<Grid item xs={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
									{(secretQuestionsLoaded) ?
										<Autocomplete
											id="r_secret_question"
											fullWidth
											value={this.state.r_secret_question}
											onChange={(e, newValue) => this.setState({r_secret_question: newValue})}
											options={this.props.secretQuestions}
											getOptionLabel={(secretQuestion) => secretQuestion.question}
											disabled={this.state.trying}
											renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'r_secret_question'} helperText={(this.state.errorInput == 'r_secret_question') ? this.state.errorMessage : ''} required margin="normal" label="Pergunta Secreta" />}
										/>
										: <CircularProgress color="primary"/>}
								</Grid>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({r_secret_answer: e.target.value})}
										margin="normal"
										id="r_secret_answer"
										label="Resposta Secreta"
										value={this.state.r_secret_answer}
										disabled={this.state.trying}
										error={this.state.errorInput == 'r_secret_answer'}
										helperText={(this.state.errorInput == 'r_secret_answer') ? this.state.errorMessage : ''}
										InputProps={{
											inputProps: {
												maxLength: 15
											}
										}}
										placeholder=""
									/>
								</Grid>
								<Grid item xs={12}>
									<FormControlLabel
										value={this.state.r_agree}
										onChange={(e, newValue) => this.setState({r_agree: newValue})}
										control={<Checkbox color="primary" checked={this.state.r_agree}/>}
										label="Lí e concordo com os Termos de Uso*"
										labelPlacement="start"
										disabled={this.state.trying}
									/>
								</Grid>
								{(this.state.errorInput == 'r_agree') ?
									<Grid item xs={12}>
										<Alert severity="error">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
								<Grid item xs={12}>
									<FormControlLabel
										value={this.state.r_allow_email}
										onChange={(e, newValue) => this.setState({r_allow_email: newValue})}
										control={<Checkbox color="primary" checked={this.state.r_allow_email} />}
										label="Aceito receber promoções e avisos por E-mail"
										labelPlacement="start"
										disabled={this.state.trying}
									/>
								</Grid>
								<Grid item xs={12}>
									<FormControlLabel
										value={this.state.r_allow_whatsapp}
										onChange={(e, newValue) => this.setState({r_allow_whatsapp: newValue})}
										control={<Checkbox color="primary" checked={this.state.r_allow_whatsapp}/>}
										label="Aceito receber promoções e avisos pelo Whatsapp"
										labelPlacement="start"
										disabled={this.state.trying}
									/>
								</Grid>
								{(this.state.errorInput == 'r_unexpected') ?
									<Grid item xs={12}>
										<Alert severity="error">
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
										required
										fullWidth
										onChange={(e) => this.setState({f_cpf: e.target.value})}
										margin="normal"
										id="f_cpf"
										label="CPF"
										value={this.state.f_cpf}
										disabled={this.state.trying}
										error={this.state.errorInput == 'f_cpf'}
										helperText={(this.state.errorInput == 'f_cpf') ? this.state.errorMessage : ''}
										placeholder="000.000.000-00"
										InputProps={{
											inputComponent: CPFMaskCustom,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<KeyboardDatePicker
										clearable
										required
										fullWidth
										margin="normal"
										label="Data de Nascimento"
										value={this.state.f_birthday}
										placeholder="10/10/2018"
										onChange={(e) => this.setState({f_birthday: e})}
										minDate={new Date(1900, 1, 1)}
										format="DD/MM/YYYY"
										disabled={this.state.trying}
										error={this.state.errorInput == 'f_birthday'}
										helperText={(this.state.errorInput == 'f_birthday') ? this.state.errorMessage : ''}
									/>
								</Grid>
								<Grid item xs={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
									{(secretQuestionsLoaded) ?
										<Autocomplete
											id="r_secret_question"
											fullWidth
											value={this.state.f_secret_question}
											onChange={(e, newValue) => this.setState({f_secret_question: newValue})}
											options={this.props.secretQuestions}
											getOptionLabel={(secretQuestion) => secretQuestion.question}
											disabled={this.state.trying}
											renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'f_secret_question'} helperText={(this.state.errorInput == 'f_secret_question') ? this.state.errorMessage : ''} required margin="normal" label="Pergunta Secreta" />}
										/>
										: <CircularProgress color="primary"/>}
								</Grid>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({f_secret_answer: e.target.value})}
										margin="normal"
										id="f_secret_answer"
										label="Resposta Secreta"
										value={this.state.f_secret_answer}
										disabled={this.state.trying}
										error={this.state.errorInput == 'f_secret_answer'}
										helperText={(this.state.errorInput == 'f_secret_answer') ? this.state.errorMessage : ''}
										InputProps={{
											inputProps: {
												maxLength: 15
											}
										}}
										placeholder=""
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({f_password: e.target.value})}
										margin="normal"
										type="password"
										id="f_password"
										label="Nova Senha"
										value={this.state.f_password}
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
										error={this.state.errorInput == 'f_password'}
										helperText={(this.state.errorInput == 'f_password') ? this.state.errorMessage : ''}
										autoComplete="new-password"
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({f_password_confirm: e.target.value})}
										margin="normal"
										type="password"
										id="f_password_confirm"
										label="Confirmação de Senha"
										value={this.state.f_password_confirm}
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
										error={this.state.errorInput == 'f_password_confirm'}
										helperText={(this.state.errorInput == 'f_password_confirm') ? this.state.errorMessage : ''}
										autoComplete="new-password"
									/>
								</Grid>
								{(this.state.errorInput == 'f_error') ?
									<Grid item xs={12}>
										<Alert severity="error">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
								{(this.state.errorInput == 'f_success') ?
								<Grid item xs={12}>
									<Alert severity="success">
										<AlertTitle>{this.state.errorMessage}</AlertTitle>
									</Alert>
								</Grid> : ''}
							</Grid>
							<input type="submit" style={{display: 'none'}}/>
						</form>
					</div> : ''}
				</DialogContent>
				<DialogActions>
					{(this.state.tab != 2) ?<Button onClick={this.handleDialogClose} disabled={this.state.trying}>
						Cancelar
					</Button> : ''}
					{(this.state.tab == 0) ?<Button onClick={() => this.props.history.push('/esqueci-minha-senha')} disabled={this.state.trying}>
						Esqueci minha senha
					</Button> : ''}
					{(this.state.tab == 2) ?<Button onClick={() => this.props.history.push('/entrar')} disabled={this.state.trying}>
						Voltar
					</Button> : ''}
					<Button onClick={this.handleSubmit} color="primary" disabled={this.state.trying}>
						{(this.state.tab == 0) ? 'Entrar' : (this.state.tab == 1) ? 'Cadastrar' : 'Redefinir Senha'}
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(LoginDialog)