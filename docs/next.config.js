module.exports = {
    async redirects() {
        return [
            {
                source: "/",
                destination: "/docs/Getting-started",
                permanent: false,
            },
            {
                source: "/docs",
                destination: "/docs/Getting-started",
                permanent: false,
            },
        ];
    },
};
