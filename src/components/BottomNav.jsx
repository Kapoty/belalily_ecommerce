import React from "react";

import {withStyles} from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import PhotoAlbumIcon from '@material-ui/icons/PhotoAlbum';
import LocalMallIcon from '@material-ui/icons/LocalMall';
import Badge from '@material-ui/core/Badge';
import FavoriteIcon from '@material-ui/icons/Favorite';

const useStyles = (theme) => ({
root: {
position: 'fixed',
bottom: '0px',
width: '100%'
},
});

const StyledBadge = withStyles((theme) => ({
badge: {
right: -3,
top: 13,
border: `2px solid #FFFFFF`,
padding: '0 4px',
},
}))(Badge);

class BottomNav extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.pages = ['/', '/favoritos', '/sacola'];
	}

	render() {
		const { classes } = this.props;
		return <React.Fragment>
			<BottomNavigation value={this.pages.indexOf(this.props.lastPage)} onChange={(event, newValue) => {
			switch(newValue) {
				case 0:
					this.props.history.push('/');
				break;
				case 1:
					if (this.props.auth)
						this.props.history.push('/favoritos');
					else
						this.props.history.push('/entrar');
				break;
				case 2:
					this.props.history.push('/sacola');
				break;
				}
			}} showLabels className={classes.root}>
			<BottomNavigationAction label="Catálogo" icon={<PhotoAlbumIcon />} />
			<BottomNavigationAction label="Favoritos" icon={<FavoriteIcon />} />
			<BottomNavigationAction label="Sacola" icon={<StyledBadge badgeContent={this.props.bagQnt} color="primary">
														<LocalMallIcon />
														</StyledBadge>}
														/>
			</BottomNavigation>
			<BottomNavigation></BottomNavigation>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(BottomNav)