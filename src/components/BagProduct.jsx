import React from "react";

import {withStyles, useTheme} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Chip from '@material-ui/core/Chip';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';

import Config from "../config/Config";

const useStyles = (theme) => ({
	root: {
		[theme.breakpoints.down('sm')]: {
			width: '200px',
		},
		[theme.breakpoints.up('md')]: {
			width: '200px',
		},
		margin: theme.spacing(0.5),
		display: 'flex',
		flexDirecton: 'row',
		flexWrap: 'wrap',
		alignItems: 'baseline',
	},
	media: {
		[theme.breakpoints.down('sm')]: {
			height: '100px',
		},
		[theme.breakpoints.up('md')]: {
			height: '150px',
		},
	},
	content: {
		display: 'flex',
		flexDirecton: 'row',
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
	qntSection: {
		display: 'flex',
		justifyContent: 'center',
		margin: theme.spacing(1),
		alignItems: 'center',
	},
	qntLabel: {
		margin: theme.spacing(0, 1),
	},
	removeSection: {
		margin: theme.spacing(1),
		display: 'flex',
		justifyContent: 'center',
	},
});

class BagProduct extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { classes } = this.props;

		let sizesLoaded = !(Object.keys(this.props.sizesById).length === 0);

		return <React.Fragment>
			<Card className={classes.root}>
				<CardActionArea>
					<CardMedia
					className={classes.media}
					image={(this.props.product.img_number > 0) ? `${Config.mediaURL}products/${this.props.product.id}/1-256.jpg` : ""}
					title={this.props.product.name}
					/>
					<CardContent>
						<Typography gutterBottom variant="h6" component="p" align="center">
							{this.props.product.name}
						</Typography>
						<Typography variant="h6" color="primary" component="p" align="center">
							R$ {this.props.product.price * this.props.product.desiredQuantity}
						</Typography>
						<div className={classes.sizeSection}>
							<div className={classes.sizeOptions}>
								{(sizesLoaded) ? <Chip className={classes.sizeChip} label={this.props.sizesById[this.props.product.sizeId].name} color="primary"/> : <CircularProgress color="primary"/>}
							</div>
						</div>
						<div className={classes.qntSection}>
							<IconButton aria-label="close" onClick={() => this.props.decreaseProductFromBag(this.props.product.id, this.props.product.sizeId, 1)} disabled={this.props.product.desiredQuantity == 1}>
								<RemoveCircleIcon />
							</IconButton>
							<Typography className={classes.qntLabel} variant="h6" color="primary" component="p" align="center">
								{this.props.product.desiredQuantity}
							</Typography>
							<IconButton aria-label="close" onClick={() => this.props.increaseProductFromBag(this.props.product.id, this.props.product.sizeId, 1)} disabled={this.props.product.desiredQuantity >= this.props.product.availableQuantity}>
								<AddCircleIcon />
							</IconButton>
						</div>
						{	(this.props.product.availableQuantity == 0) ?
							<Alert severity="error">
								<AlertTitle>Produto indisponível</AlertTitle>
							</Alert> : (this.props.product.desiredQuantity > this.props.product.availableQuantity) ?
							<Alert severity="error">
								<AlertTitle>Limite excedido</AlertTitle>
								Quantidade disponível: {this.props.product.availableQuantity}
							</Alert> : ''
						}
						<div className={classes.removeSection}>
							<IconButton aria-label="close" onClick={() => this.props.deleteProductFromBag(this.props.product.id, this.props.product.sizeId)}>
								<DeleteIcon />
							</IconButton>
						</div>
					</CardContent>
				</CardActionArea>
			</Card>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(BagProduct)