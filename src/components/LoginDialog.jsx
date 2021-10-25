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

import Config from "../config/Config";

const useStyles = (theme) => ({
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

class LoginDialog extends React.Component {

	constructor(props) {
		super(props);
		this.pageReg = new RegExp('\^/login', '');
		this.state = {dialogOpen: false, tab: 0, login: '', password: '', errorInput: '', errorMessage: '', trying: false};
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.isOpened = this.isOpened.bind(this);
		this.changeTab = this.changeTab.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleDialogClose() {
		this.setState({errorInput: ''});
		this.props.history.push(this.props.lastPage);
	}

	isOpened() {
		this.state.dialogOpen = this.pageReg.test(this.props.location.pathname);
		if (this.state.dialogOpen && this.props.auth)
			this.handleDialogClose();
	}

	changeTab(e, newValue) {
		this.setState({tab: newValue});
	}

	handleSubmit(e) {
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
					console.log(data);
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
		}
	}

	render() {
		const { classes } = this.props;

		this.isOpened();

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
						<Tab label="Já possuo conta" disabled={this.state.trying}/>
						<Tab label="Quero me cadastrar" disabled={this.state.trying}/>
					</Tabs>
				</DialogTitle>
				<DialogContent dividers ref={this.contentRef}>
					<div style={{display: this.state.tab == 0 ? 'block' : 'none'}}>
						<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
							<TextField required fullWidth onChange={(e) => this.setState({login: e.target.value})} margin="normal" id="login" label="CPF ou E-mail" defaultValue={this.state.login} InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<AccountCircle />
									</InputAdornment>
									),
								}} disabled={this.state.trying} error={this.state.errorInput == 'login'} helperText={(this.state.errorInput == 'login') ? this.state.errorMessage : ''} autoComplete='username'/>
							<TextField required fullWidth onChange={(e) => this.setState({password: e.target.value})} margin="normal" type="password" id="password" label="Senha" defaultValue={this.state.password} InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<LockIcon />
									</InputAdornment>
									),
								}} disabled={this.state.trying} error={this.state.errorInput == 'password'} helperText={(this.state.errorInput == 'password') ? this.state.errorMessage : ''} autoComplete='password'/>
							<input type="submit" style={{display: 'none'}}/>
						</form>
					</div>
					<div style={{display: this.state.tab == 1 ? 'block' : 'none'}}>
						Cadastrar
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleDialogClose} disabled={this.state.trying}>
						Cancelar
					</Button>
					<Button onClick={this.handleSubmit} color="primary" disabled={this.state.trying}>
						{(this.state.tab == 0) ? 'Entrar' : 'Cadastrar'}
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(LoginDialog)