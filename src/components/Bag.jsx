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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Alert, AlertTitle } from '@material-ui/lab';

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
	}
});

class Bag extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.handleNext = this.handleNext.bind(this);
		this.handleBack = this.handleBack.bind(this);
	}

	handleNext() {
		if (this.props.customerPreOrder == null)
			if (this.props.bag.step == 0)
				this.props.setBagStep(1);
	}

	handleBack() {
		if (this.props.customerPreOrder == null)
			if (this.state.step == 1)
				this.props.setBagStep(0);
	}

	componentDidUpdate(prevProps) {
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

		return <React.Fragment>
			<div className={classes.root}>
				<Stepper activeStep={(this.props.customerPreOrder == null) ? this.props.bag.step : this.props.customerPreOrder.step + 2} orientation="vertical" className={classes.stepper}>
					<Step key={0}>
						<StepLabel>Sacola</StepLabel>
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
						<StepLabel>Identificação</StepLabel>
						<StepContent>
						</StepContent>
					</Step>
					<Step key={2}>
						<StepLabel>Endereço e Cupom de desconto</StepLabel>
						<StepContent>
						</StepContent>
					</Step>
					<Step key={3}>
						<StepLabel>Pagamento</StepLabel>
						<StepContent>
						</StepContent>
					</Step>
					<Step key={4}>
						<StepLabel>Confirmação</StepLabel>
						<StepContent>
						</StepContent>
					</Step>
					<Step key={5}>
						<StepLabel>Conclusão</StepLabel>
						<StepContent>
						</StepContent>
					</Step>
				</Stepper>
			</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(Bag)