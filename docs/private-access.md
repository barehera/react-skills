# Private access

React Skills lives in a private GitHub repository. Each machine that installs
it gets its own read-only deploy key: an SSH key that opens this one
repository and nothing else. The machine needs no GitHub login, email, or
token, and access is removed by deleting its key.

## Set up a machine

On Windows, run these in Git Bash.

1. Create a key. The `-C` label replaces the default comment, which would
   otherwise contain your user and machine name. Press Enter twice for no
   passphrase, or set one.

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/react_skills -C react-skills
   ```

2. Send `~/.ssh/react_skills.pub` to the repository owner. It is the public
   half and safe to share. Never share `~/.ssh/react_skills`.
3. Add a host alias to `~/.ssh/config`, so git uses this key even when the
   machine already has another GitHub key, such as a work account's:

   ```text
   Host react-skills
     HostName github.com
     User git
     IdentityFile ~/.ssh/react_skills
     IdentitiesOnly yes
   ```

   If the network blocks SSH on port 22, use `HostName ssh.github.com` and
   add `Port 443`.

4. After the owner adds the key, check access. GitHub answers with the
   repository name and says shell access is not provided, which is expected.

   ```bash
   ssh -T git@react-skills
   ```

5. Run the installer from a project root. See [Install](../README.md#install)
   for what it asks and every option.

   ```bash
   npx --yes git+ssh://git@react-skills/barehera/react-skills.git
   ```

## Grant access

In the repository, open **Settings → Deploy keys → Add deploy key**.

- **Title:** a label only you need to understand, such as `me-work` or
  `friend-laptop`. Nobody else sees it.
- **Key:** the contents of the `.pub` file.
- **Allow write access:** leave it unchecked.

Use one key per machine, so each can be removed on its own.

## Remove access

Delete the machine's key on the same page. From then on, the installer cannot
download new releases on that machine. Skills a machine already installed
cannot be taken back.

## What stays private

- **The machine** holds only a key for this repository, labelled
  `react-skills`, not a GitHub login.
- **Project repositories** do not receive the skills: the installer lists them
  in `.git/info/exclude`, which is never committed.
- **Nothing is uploaded.** npx only downloads the release; the installer
  copies it into the project.
- **Your AI agent** still reads the skills, like any other instructions in its
  context.
