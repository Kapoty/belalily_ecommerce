import React from "react";

import {withStyles, useTheme} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { Alert, AlertTitle } from '@material-ui/lab';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import CircularProgress from '@material-ui/core/CircularProgress';

import Config from "../config/Config";

const useStyles = (theme) => ({
	root: {
		[theme.breakpoints.down('sm')]: {
			width: '180px',
		},
		[theme.breakpoints.up('md')]: {
			width: '250px',
		},
		margin: theme.spacing(1),
	},
	media: {
		[theme.breakpoints.down('sm')]: {
			height: '200px',
		},
		[theme.breakpoints.up('md')]: {
			height: '250px',
		},
	},
	sizeSection: {
		margin: theme.spacing(1),
	},
	sizeChip: {
		margin: theme.spacing(0.5),
	},
	sizeOptions: {
		display: 'flex',
		justifyContent: 'center',
	},
	removeSection: {
		margin: theme.spacing(1),
		display: 'flex',
		justifyContent: 'center',
	},
});

class WishlistProduct extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { classes } = this.props;

	let sizesLoaded = !(Object.keys(this.props.sizesById).length === 0);

		return <React.Fragment>
			<Card className={classes.root} style={{order: this.props.wishlistProduct.id}} onClick={() => this.props.history.push('/p/' + this.props.wishlistProduct.product_id)}>
				<CardActionArea>
					<CardMedia
					className={classes.media}
					image={(this.props.wishlistProduct.product_img_number > 0) ? `${Config.mediaURL}products/${this.props.wishlistProduct.product_id}/1-256.jpg` : ""}
					title={this.props.wishlistProduct.name}
					/>
					<CardContent>
						<Typography gutterBottom variant="h6" component="h6" align="center">
							{this.props.wishlistProduct.product_name}
						</Typography>
						<div className={classes.sizeSection}>
							<div className={classes.sizeOptions}>
								{(sizesLoaded) ? <Chip className={classes.sizeChip} label={this.props.sizesById[this.props.wishlistProduct.size_id].name} color="primary"/> : <CircularProgress color="primary"/>}
							</div>
						</div>
						{	(!this.props.wishlistProduct.product_isAvailable) ?
							<Alert severity="error">
								<AlertTitle>Produto indisponível</AlertTitle>
							</Alert> :
							<Alert severity="success">
								<AlertTitle>Produto disponível</AlertTitle>
							</Alert>
						}
						<div className={classes.removeSection}>
							<IconButton aria-label="close" onClick={(e) => {
								e.stopPropagation();
								this.props.deleteProductFromCustomerWishlist(this.props.wishlistProduct.product_id, this.props.wishlistProduct.size_id);
							}}>
								<DeleteIcon />
							</IconButton>
						</div>
					</CardContent>
				</CardActionArea>
			</Card>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(WishlistProduct)