import React from "react";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import {withStyles, useTheme} from '@material-ui/core/styles';

import {toBRL} from '../util/Currency';

const useStyles = (theme) => ({
	progressArea: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		padding: theme.spacing(1),
		boxSizing: 'border-box',
	}
});

class BagProductsTable extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidUpdate(prevProps) {
	}

	render() {
		const { classes } = this.props;

		let sizesLoaded = !(Object.keys(this.props.sizesById).length === 0);
		let preOrderLoaded = !(Object.keys(this.props.preOrder).length === 0);

		return <React.Fragment>
				<Typography variant="h6" gutterBottom>
					Resumo do Pedido
				</Typography>
				<TableContainer component={Paper}>
					{(sizesLoaded && preOrderLoaded) ? <React.Fragment>
						<Table aria-label="spanning table" size="small">
							<TableHead>
								<TableRow>
									<TableCell>Produto</TableCell>
									<TableCell align="right">Qtd.</TableCell>
									<TableCell align="right">Valor</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{this.props.preOrder.products.map((product, i) => <TableRow key={i}>
									<TableCell>{`${product.name} (${this.props.sizesById[product.size_id].name})`}</TableCell>
									<TableCell align="right">{product.desiredQuantity}</TableCell>
									<TableCell align="right">
										<Typography variant="body1" color="primary" component="p">
										<b>{toBRL(product.price_in_cash * product.desiredQuantity)}</b>
										</Typography>
										<Typography variant="subtitle2" component="p" color="textSecondary" gutterBottom>
											à vista no PIX
										</Typography>
										<Typography variant="body2" color="textPrimary" component="p">
											ou <b>{toBRL(product.price * product.desiredQuantity)}</b> em até 12x
										</Typography>
									</TableCell>
								</TableRow>)}
								<TableRow>
									<TableCell colSpan={2} align="right">Total dos produtos</TableCell>
									<TableCell align="right">{toBRL(this.props.preOrder.products_total_in_cash)}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={2} align="right">Entrega</TableCell>
									<TableCell align="right">{toBRL(this.props.preOrder.shipping_cost)}</TableCell>
								</TableRow>
								{(this.props.preOrder.coupon_applied) ?
									<TableRow>
										<TableCell colSpan={2} align="right">Desconto de Cupom</TableCell>
										<TableCell align="right">{toBRL(-this.props.preOrder.coupon_discount_in_cash)}</TableCell>
									</TableRow> : ''}
								<TableRow>
									<TableCell colSpan={2} align="right">Valor total</TableCell>
									<TableCell align="right">
										<Typography variant="body1" color="primary" component="p">
										<b>{toBRL(this.props.preOrder.total_in_cash)}</b>
										</Typography>
										<Typography variant="subtitle2" component="p" color="textSecondary" gutterBottom>
											à vista no PIX
										</Typography>
										<Typography variant="body2" color="textPrimary" component="p">
											ou <b>{toBRL(this.props.preOrder.total)}</b> em até 12x
										</Typography>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
				</TableContainer>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(BagProductsTable)