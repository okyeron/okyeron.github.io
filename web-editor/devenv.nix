{ pkgs, lib, config, inputs, ... }:

{
  cachix.enable = false;

  packages = [ pkgs.git ];

  languages.javascript = {
    enable = true;

    package = pkgs.nodejs_24;

    pnpm = {
      enable = true;

      install.enable = true;
    };
  };

  # See full reference at https://devenv.sh/reference/options/
}
