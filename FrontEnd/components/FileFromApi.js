import Image from 'next/image'
function Main({ src, fileName, fileExt }) {
    return (
        <a href={process.env.apiPath + src} download>
            <div className="d-flex justify-content-center">
                <Image src="/img/icon/icon-download.png" width="70" height="70" />
            </div>
            {fileName ?
                <div className="text-center text-overflow-ellipsis">
                    {fileName + (fileExt ? "." + fileExt : null)}
                </div>
                :
                null
            }
        </a>
    );
}

export default Main