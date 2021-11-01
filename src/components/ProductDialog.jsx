import React from "react";

import {withStyles, withWidth} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';
import Chip from '@material-ui/core/Chip';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import TextField from '@material-ui/core/TextField';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import CircularProgress from '@material-ui/core/CircularProgress';

import Config from "../config/Config";

const useStyles = (theme) => ({
	root: {
		margin: 0,
		padding: theme.spacing(2),
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500],
	},
	gallerySection: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		overflow: 'hidden',
		backgroundColor: theme.palette.background.paper,
		margin: theme.spacing(3, 2),
	},
	imageList: {
		flexWrap: 'nowrap',
		// Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
		transform: 'translateZ(0)',
		width: '100%',
		'&::-webkit-scrollbar': {
			height: '5px',
			[theme.breakpoints.up('md')]: {
				height: '10px',
			},
			backgroundColor: theme.palette.background.paper,
		},
		'&::-webkit-scrollbar-thumb:horizontal': {
			backgroundColor: theme.palette.primary.main,
		},
	},
	imageListItem: {
		'&:hover': {
			cursor: 'pointer',
			'& svg': {
				opacity: '100%',
				transition: 'opacity 0.25s',
			}
		}
	},
	zoomInIcon: {
		position: 'absolute',
		left: '50%',
		top: '50%',
		color: 'white',
		opacity: '50%',
		fontSize: '50px',
		transform: 'translate(-50%, -50%)',
		transition: 'opacity 0.25s',
		filter: 'drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))',
	},
	sizeSection: {
		margin: theme.spacing(3, 2),
	},
	sizeChip: {
		margin: theme.spacing(0.5),
	},
	sizeOptions: {
		display: 'flex',
		justifyContent: 'center',
	},
	priceSection: {
		margin: theme.spacing(3, 2),
	},
	desiredQuantitySection: {
		display: 'flex',
		justifyContent: 'center',
		margin: theme.spacing(3, 2),
		alignItems: 'center',
	},
	desiredQuantityLabel: {
		margin: theme.spacing(0, 1),
	},
	descSection: {
		margin: theme.spacing(3, 2),
	},
	availableQuantitySection: {
		margin: theme.spacing(3, 2),
	}
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

class ProductDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {dialogOpen: false, imageOpen: false, image: '', productId: -1, product: {},
			desiredQuantity: 0, selectedSize: 0, availableQuantity: -1};
		this.pageReg = /^\/p\/[\d]+/;
		this.contentRef = React.createRef();
		this.descSectionRef = React.createRef();

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleAddToBag = this.handleAddToBag.bind(this);
		this.openImage = this.openImage.bind(this);
		this.closeImage = this.closeImage.bind(this);
		this.handleKnowMore = this.handleKnowMore.bind(this);
		this.setSize = this.setSize.bind(this);
		this.addQnt = this.addQnt.bind(this);
		this.removeQnt = this.removeQnt.bind(this);
		this.getProduct = this.getProduct.bind(this);
		this.getProductQuantity = this.getProductQuantity.bind(this);
		this.handleAddToWishlist = this.handleAddToWishlist.bind(this);
	}

	getProduct() {
		fetch(Config.apiURL + "products/" + this.state.productId, {
			method: "GET"
		})
		.then((resp) => {
			resp.json().then((data) => {
				if (resp.status == 500 && data.error == 'no product matches given id')
					return this.props.history.push("/");
				if (resp.status != 200)
					setTimeout(this.getProduct, 5000);
				this.setState({product: data.product});
			})
		})
		.catch((e) => {
			setTimeout(this.getProduct, 5000);
			console.log(e);
		});
	}

	getProductQuantity() {
		fetch(Config.apiURL + "products/" + this.state.productId + "/quantity/" + this.state.selectedSize, {
			method: "GET"
		})
		.then((resp) => {
			if (resp.status != 200)
				setTimeout(this.getProductQuantity, 5000);
			else resp.json().then((data) => {
				this.setState({availableQuantity: data.quantity, desiredQuantity: (data.quantity>0) ? 1 : 0});
			})
		})
		.catch((e) => {
			setTimeout(this.getProductQuantity, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.props.history.push(this.props.lastPage);
	}

	handleAddToBag() {
		this.props.addProductToBag(this.state.product, this.state.selectedSize, this.state.desiredQuantity, this.state.availableQuantity);
		this.props.history.push(this.props.lastPage);
	}

	handleAddToWishlist() {
		if (this.props.auth)
			this.props.addProductToCustomerWishlist(this.state.product.name, this.state.product.id, this.state.selectedSize);
		else this.props.history.push('/entrar');
	}

	openImage(img) {
		this.setState({imageOpen: true, image: img});
	}

	closeImage() {
		this.setState({imageOpen: false});
	}

	handleKnowMore() {
		this.contentRef.current.scrollTop =  this.descSectionRef.current.offsetTop - this.contentRef.current.offsetTop - 10;
	}

	setSize(sizeId) {
		if (this.state.availableQuantity != -1 || this.state.selectedSize == 0) {
			this.state.selectedSize = sizeId;
			this.setState({availableQuantity: -1, desiredQuantity: 0});
			this.getProductQuantity();
		}
	}

	addQnt() {
		this.setState({desiredQuantity: this.state.desiredQuantity+1});
	}

	removeQnt() {
		this.setState({desiredQuantity: this.state.desiredQuantity-1});
	}

	render() {
		const { classes } = this.props;

		if (this.pageReg.test(this.props.location.pathname)) {
			if (this.state.dialogOpen == false) {
				this.state.product = {};
				this.state.availableQuantity = -1;
				this.state.desiredQuantity = 0;
				this.state.selectedSize = 0;
				this.state.productId = this.props.location.pathname.match(/(?<=\/p\/)[\d]+/)[0];
				this.getProduct();
				this.state.dialogOpen = true;
			}
		} else if (this.state.dialogOpen == true) {
			this.state.dialogOpen = false;
		}

		let productLoaded = !(Object.keys(this.state.product).length === 0);
		let sizesLoaded = !(Object.keys(this.props.sizesById).length === 0);

		return <React.Fragment>
			<Dialog fullScreen open={this.state.dialogOpen} onClose={this.handleDialogClose} TransitionComponent={Transition} className={classes.root}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose}>
					{(productLoaded) ? this.state.product.name : '...'}
					<IconButton aria-label="close" className={classes.closeButton} onClick={this.handleDialogClose}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers ref={this.contentRef}>
					<div className={classes.gallerySection}>
						{(productLoaded) ? <React.Fragment>
							<Hidden only={['sm', 'md', 'lg', 'xl']}>
								<ImageList className={classes.imageList} cols={1} rowHeight={250}>
									{[...Array(this.state.product.img_number).keys()].map((imgId) => (
										<ImageListItem className={classes.imageListItem} key={imgId} onClick={() => this.openImage(`${Config.mediaURL}products/${this.state.product.id}/${imgId+1}.jpg`)}>
											<img src={`${Config.mediaURL}products/${this.state.product.id}/${imgId+1}-512.jpg`} alt={this.state.product.name}/>
											<ZoomInIcon className={classes.zoomInIcon}/>
										</ImageListItem>
									))}
								</ImageList>
							</Hidden>
							<Hidden only={['xs', 'md', 'lg', 'xl']}>
								<ImageList className={classes.imageList} cols={2} rowHeight={300}>
									{[...Array(this.state.product.img_number).keys()].map((imgId) => (
										<ImageListItem className={classes.imageListItem} key={imgId} onClick={() => this.openImage(`${Config.mediaURL}products/${this.state.product.id}/${imgId+1}.jpg`)}>
											<img src={`${Config.mediaURL}products/${this.state.product.id}/${imgId+1}-512.jpg`} alt={this.state.product.name}/>
											<ZoomInIcon className={classes.zoomInIcon}/>
										</ImageListItem>
									))}
								</ImageList>
							</Hidden>
							<Hidden smDown>
								<ImageList className={classes.imageList} cols={3} rowHeight={300}>
									{[...Array(this.state.product.img_number).keys()].map((imgId) => (
										<ImageListItem className={classes.imageListItem} key={imgId} onClick={() => this.openImage(`${Config.mediaURL}products/${this.state.product.id}/${imgId+1}.jpg`)}>
											<img src={`${Config.mediaURL}products/${this.state.product.id}/${imgId+1}-512.jpg`} alt={this.state.product.name}/>
											<ZoomInIcon className={classes.zoomInIcon}/>
										</ImageListItem>
									))}
								</ImageList>
							</Hidden>
						</React.Fragment> : ''}
					</div>
					<div className={classes.priceSection}>
						<Typography variant="h6" color="primary" component="p" align="center">
							R$ {(productLoaded) ? this.state.product.price : '??.??'}
						</Typography>
					</div>
					<div className={classes.sizeSection}>
						<Typography gutterBottom align="center" variant="body1">
							Selecione o Tamanho
						</Typography>
						<div className={classes.sizeOptions}>
							{(productLoaded && sizesLoaded && this.state.product.sizes != null) ? this.state.product.sizes.split(',').map((sizeId) => 
								<Chip className={classes.sizeChip} label={this.props.sizesById[sizeId].name} key={sizeId} onClick={() => this.setSize(sizeId)} color={this.state.selectedSize == sizeId ? "primary" : 'default'}/>)
								: <CircularProgress color="primary"/>
							}
						</div>
					</div>
					{(this.state.availableQuantity > 0) ?
					<div className={classes.desiredQuantitySection}>
						<IconButton aria-label="close" onClick={this.removeQnt} disabled={!productLoaded || this.state.desiredQuantity <= 1}>
							<RemoveCircleIcon />
						</IconButton>
						<Typography className={classes.desiredQuantityLabel} variant="h6" color="primary" component="p" align="center">
							{this.state.desiredQuantity}
						</Typography>
						<IconButton aria-label="close" onClick={this.addQnt} disabled={!productLoaded || this.state.selectedSize == 0 || this.state.availableQuantity == -1 || this.state.desiredQuantity >= this.state.availableQuantity}>
							<AddCircleIcon />
						</IconButton>
					</div> : ''}
					{(this.state.availableQuantity != -1) ?
					<div className={classes.availableQuantitySection}>
						<Typography variant="body2" color="primary" component="p" align="center">
						{this.state.availableQuantity} {(this.state.availableQuantity <= 1) ? 'unidade disponível' : 'unidades disponíveis'}
						</Typography>
					</div> : ''}
					<Divider variant='middle'/>
					<div className={classes.descSection} ref={this.descSectionRef}>
						<Typography gutterBottom>
							<span dangerouslySetInnerHTML={{ __html: (productLoaded) ? this.state.product.description : '...'}}></span>
						</Typography>
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleKnowMore}>
						Saiba Mais
					</Button>
					<Button onClick={this.handleAddToWishlist} disabled={!productLoaded || this.state.selectedSize == 0}>
						Favoritar
					</Button>
					<Button onClick={this.handleAddToBag} color="primary" disabled={!productLoaded || this.state.desiredQuantity == 0}>
						Comprar
					</Button>
				</DialogActions>
				</Dialog>
				<Dialog fullScreen open={this.state.imageOpen} onClose={this.closeImage} TransitionComponent={Transition}>
					<DialogTitle id="openImageDialog" onClose={this.closeImage}>
					Visualizar Foto
						<IconButton aria-label="close" className={classes.closeButton} onClick={this.closeImage}>
							<CloseIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent dividers style={{display: 'flex', justifyContent: 'space-between'}}>
						<img src={this.state.image} alt={'title'} style={{height: '100%'}} onClick={() => this.openImage(img)}/>
					</DialogContent>
				</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(ProductDialog)