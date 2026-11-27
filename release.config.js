const forceMajor = process.env.RELEASE_MAJOR === "true";

const releaseRules = forceMajor
    ? [{ release: "major" }]
    : [{ breaking: true, release: "minor" }];

const config = {
    branches: ["main", { name: "dev", prerelease: "dev" }],
    tagFormat: "v${version}",
    plugins: [
        ["@semantic-release/commit-analyzer", { releaseRules }],
        "@semantic-release/release-notes-generator",
        [
            "@semantic-release/changelog",
            {
                changelogFile: "CHANGELOG.md",
                changelogTitle: "# Changelog",
            },
        ],
        [
            "@semantic-release/exec",
            {
                prepareCmd:
                    "npm --prefix backend version ${nextRelease.version} --no-git-tag-version --allow-same-version && npm --prefix frontend version ${nextRelease.version} --no-git-tag-version --allow-same-version",
            },
        ],
        [
            "@semantic-release/git",
            {
                assets: [
                    "CHANGELOG.md",
                    "backend/package.json",
                    "backend/package-lock.json",
                    "frontend/package.json",
                    "frontend/package-lock.json",
                ],
                message:
                    "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
            },
        ],
        "@semantic-release/github",
    ],
};

export default config;
