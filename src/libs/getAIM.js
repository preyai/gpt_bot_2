
async function getAIM(jwt) {
    const res = await fetch("https://iam.api.cloud.yandex.net/iam/v1/tokens",{
        method:"POST",
        body: JSON.stringify({
            jwt
        })
    })
    const result = await res.json()
    return result.iamToken
}

export default getAIM