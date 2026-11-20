import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/madrasa-logo.png" alt="Madrasa Dar-e-Arqam Gurguri" {...props} />;
}
