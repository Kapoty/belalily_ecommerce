import React from "react";

import {withStyles, useTheme} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import Product from './Product'

const useStyles = (theme) => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		overflow: 'hidden',
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
				<Paper square>
					 
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
				</Paper>
				{this.props.categories.map((category, i) => <div style={{display: this.state.tab == i ? 'block' : 'none'}} key={category.id}>
					<div className={classes.products}>
							{this.props.products.map((product) => (product.categories != null && product.categories.split(',').includes(String(category.id))) ?
								<Product key={product.id} position={-product.position} product={product} history={this.props.history}/> : '' )}
					</div>
				</div>)}
			</React.Fragment>}
		</React.Fragment>
	}

}

export default withStyles(useStyles)(Catalog)