import React from "react";

import {withStyles, useTheme} from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search'
import Badge from '@material-ui/core/Badge';

import Product from './Product'

const useStyles = (theme) => ({
	paper: {
		display: 'flex',
		justifyContent: 'center',
		marginTop: theme.spacing(1),
	},
	products: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	progressArea: {
		display: 'flex',
		width: '100%',
		justifyContent: 'center',
		margin: theme.spacing(1),
	}
});

class Catalog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {tab: 0};
		this.changeTab = this.changeTab.bind(this);
	}

	changeTab(e, newValue) {
		this.setState({tab: newValue});
	}

	render() {
		const { classes } = this.props;
		return <React.Fragment>
			{(this.props.categories.length == 0) ? <div className={classes.progressArea}><CircularProgress color="primary"/></div> :
			<React.Fragment>
				<div className={classes.paper}>
					 
					<Tabs
					value={this.state.tab}
					indicatorColor="primary"
					textColor="primary"
					onChange={this.changeTab}
					selectionFollowsFocus
					centered
					>
						{this.props.categories.map((category) => <Tab label={category.name} key={category.id}/>)}
					</Tabs>

					<IconButton edge="end" color="inherit" aria-label="search" onClick={this.props.openFilter}>
						<Badge color="primary" badgeContent=" " variant="dot" overlap="circular" invisible={!this.props.filtered}>
							<SearchIcon />
						</Badge>
					</IconButton>
				</div>
				{this.props.categories.map((category, i) => <div style={{display: this.state.tab == i ? 'block' : 'none'}} key={category.id}>
					<div className={classes.products}>
							{this.props.products.map((product) => ( product.categories != null && product.categories.split(',').includes(String(category.id)) && (this.props.filter.sizes.length == 0 || product.sizes.split(',').some((s) => this.props.filter.sizes.includes(s))) ) ?
								<Product key={product.id} position={(this.props.filter.order == 1) ? -product.position : (this.props.filter.order == 2) ? product.price : -product.price} product={product} history={this.props.history}/> : '' )}
					</div>
				</div>)}
			</React.Fragment>}
		</React.Fragment>
	}

}

export default withStyles(useStyles)(Catalog)