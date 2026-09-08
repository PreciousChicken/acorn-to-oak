{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  name = "acorn-to-oak-site";

  buildInputs = [
    pkgs.nodejs # npm / npx / @tailwindcss/cli — build-only, not shipped
    pkgs.vips # vipsthumbnail — one-off source image optimization
    pkgs.imagemagick # convert — favicon.ico / apple-touch-icon.png from the client logo
    pkgs.python3
  ];

  shellHook = ''
    echo "acorn-to-oak dev shell: node $(node --version), $(vipsthumbnail --vips-version 2>&1 | head -n1)"
  '';
}
