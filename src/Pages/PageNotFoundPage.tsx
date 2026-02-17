
function PageNotFoundPage() {
    return (
        // A Standard 404 Not Found Page
        <>
            <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100'>
                <h1 className='text-6xl font-bold text-gray-800'>404</h1>
                <p className='text-xl text-gray-600 mt-4'>Page Not Found</p>
                <a href="/" className='mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'>Go to Home</a>
            </div>
        </>
    )
}

export default PageNotFoundPage