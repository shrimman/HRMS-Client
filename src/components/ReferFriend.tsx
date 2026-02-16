
function ReferFriend() {
    return (
        <>
            <h1 className="text-4xl font-bold text-foreground mb-2">
                Refer a Friend
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
                Refer a friend to this job and earn rewards!
            </p>
            <p> Friend's Email</p>
            <input type="text" placeholder="Friend's Email" className="border border-primary-300 rounded-md p-2 w-full mb-4" />
            <p> Friend's Name</p>
            <input type="text" placeholder="Friend's Name" className="border border-primary-300 rounded-md p-2 w-full mb-4" />
            <p> Add a Note for HR</p>
            <input type="text" placeholder="Your Message (optional)" className="border border-primary-300 rounded-md p-2 w-full mb-4" />
            <input type="file" className="border border-primary-300 rounded-md p-2 w-full mb-4" />
            <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                Send Referral
            </button>
        </>
    )
}

export default ReferFriend  