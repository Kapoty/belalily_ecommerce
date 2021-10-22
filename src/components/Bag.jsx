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
});

class Bag extends React.Component {

	constructor(props) {
		super(props);
		this.state = {step: 0};
		this.handleNext = this.handleNext.bind(this);
		this.handleBack = this.handleBack.bind(this);
	}

	handleNext() {
	}

	handleBack() {
	}

	componentDidUpdate(prevProps) {
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
			<div className={classes.root}>
				<Stepper activeStep={this.state.step} orientation="vertical" className={classes.stepper}>
					<Step key={0}>
						<StepLabel>Escolha os seus produtos</StepLabel>
						<StepContent>
							<div className={classes.cards}>
								{this.props.bag.products.map((product) => 
									<BagProduct key={product.id+'-'+product.sizeId} product={product} sizes={this.props.sizes}
									increaseProductFromBag={this.props.increaseProductFromBag}
									decreaseProductFromBag={this.props.decreaseProductFromBag}
									deleteProductFromBag={this.props.deleteProductFromBag}/>)}
							</div>
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
										disabled={true}
									>
										Avançar
									</Button>
								</div>
							</div>
						</StepContent>
					</Step>
				</Stepper>
			</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(Bag)