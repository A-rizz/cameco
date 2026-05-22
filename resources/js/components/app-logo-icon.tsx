export default function AppLogoIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            src="/logo.svg" 
            alt="Cameco Logo"
            {...props}
            className={props.className || 'h-10 w-auto'}
        />
    );
}
