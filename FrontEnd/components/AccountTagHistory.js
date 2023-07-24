import { useRouter } from 'next/router'
import Image from 'next/image'

export default function Main() {
    const router = useRouter();
    return (
        <div className="tag-history">
            <div className="container p-0">
                <div className=" padding-row row align-items-center">
                    <Image src="/img/icon/icon-account.png" width="24" height="24" />
                    <div className="primaryLabel">
                        {router.pathname}
                    </div>
                </div>
            </div>
        </div>
    )
}