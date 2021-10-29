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
									message = "Erro inesperado";
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
		}
		this.setState({trying: true});
	}

	handleCancel() {
		this.setState({editing: false});
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
						let r_district = null;
						for (let i=0; i<this.props.districts.length; i++)
							if (this.props.districts[i].api_name == data.bairro) {
								r_district = this.props.districts[i];
								break;
							}
						this.setState({street: data.logradouro, complement: data.complemento, district: r_district});
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
		}
	}

	render() {
		const { classes } = this.props;

		this.isOpened();

		let customerInfoLoaded = !(Object.keys(this.props.customerInfo).length === 0);
		let citiesLoaded = !(Object.keys(this.props.cities).length === 0);
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
							</form>
						</div> : ''}
						{(this.state.tab < 2) ? <React.Fragment>
							{(!this.state.editing) ? <Button onClick={this.handleChangeInfo} disabled={this.state.trying}>
								Atualizar {(this.state.tab == 0) ? 'Informações' : 'Endereço'}
							</Button> : <React.Fragment>
								<Button onClick={this.handleCancel} disabled={this.state.trying}>
									Cancelar
								</Button>
								<Button onClick={this.handleSubmit} disabled={this.state.trying} color="primary">
									Salvar {(this.state.tab == 0) ? 'Informações' : 'Endereço'}
								</Button>
							</React.Fragment>}
						</React.Fragment> : ''}
					</React.Fragment> : ''}
					{(!customerInfoLoaded) ? <div className={classes.progressArea}><CircularProgress color="primary"/></div> : ''}
								{/*
								
							</Grid>
						</form>
					</div> : ''
							{/*
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
											getOptionLabel={(district) => `${district.name} - ${this.props.cities[district.city_id].name}/${this.props.cities[district.city_id].uf}`}
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
										defaultValue={this.state.r_email}
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
										defaultValue={this.state.r_password}
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
										defaultValue={this.state.r_password_confirm}
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
					</div> : ''}*/}
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