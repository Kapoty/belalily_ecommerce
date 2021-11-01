import React from "react";

import {withStyles, useTheme} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import WishlistProduct from './WishlistProduct';
import Typography from '@material-ui/core/Typography';

const useStyles = (theme) => ({
	root: {
		width: '100%',
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
		marginTop: theme.spacing(2),
	},
	cards: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
	}
});

class Wishlist extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidUpdate(prevProps) {
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
			<div className={classes.root}>
				<Typography variant="h4" align='center' gutterBottom style={{width: '100%'}}>
					Lista de Desejos
				</Typography>
				{(this.props.auth) ? ((this.props.customerWishlist.length != 0) ? 
					this.props.customerWishlist.map((wishlistProduct) => <WishlistProduct key={wishlistProduct.id+'-'+wishlistProduct.size_id} wishlistProduct={wishlistProduct} sizesById={this.props.sizesById} history={this.props.history} deleteProductFromCustomerWishlist={this.props.deleteProductFromCustomerWishlist}/>)
					: <Typography align='center'>
						<p>Os produtos que você adicionar na sua lista de desejos aparecerão aqui.</p>
						</Typography>)
				: <Button onClick={() => this.props.history.push('/entrar')}>Acesse sua conta para visualizar a sua lista de desejos</Button>}
			</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(Wishlist)