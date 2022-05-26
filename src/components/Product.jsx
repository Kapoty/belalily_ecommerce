import React from "react";

import {withStyles, useTheme} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Alert, AlertTitle } from '@material-ui/lab';

import Config from "../config/Config";
import {toBRL} from '../util/Currency';

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
	alert: {
		marginTop: theme.spacing(1),
	}
});

class Product extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { classes } = this.props;
		return <React.Fragment>
			<Card className={classes.root} style={{order: this.props.position}} onClick={() => this.props.history.push(`/p/${this.props.product.id}`)}>
				<CardActionArea>
					<CardMedia
					className={classes.media}
					image={(this.props.product.img_number > 0) ? `${Config.mediaURL}products/${this.props.product.id}/1-256.jpg` : ""}
					title={this.props.product.name}
					/>
					<CardContent>
						<Typography gutterBottom variant="h6" component="h6" align="center">
							{this.props.product.name}
						</Typography>
						<Typography variant="h6" color="primary" component="p" align="center">
							{toBRL(this.props.product.price_in_cash)}
						</Typography>
						<Typography variant="subtitle2" component="p" align="center" color="textSecondary">
							à vista no PIX
						</Typography>
						{	(this.props.product.available == 0) ?
							<Alert severity="error" className={classes.alert}>
								<AlertTitle align="center">Esgotado</AlertTitle>
							</Alert> : ''
						}
					</CardContent>
				</CardActionArea>
			</Card>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(Product)