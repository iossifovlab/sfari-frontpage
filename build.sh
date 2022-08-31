#!/bin/bash

shopt -s extdebug
shopt -s inherit_errexit
set -e

. build-scripts/loader-extended.bash

loader_addpath build-scripts/

# shellcheck source=build-scripts/libmain.sh
include libmain.sh
# shellcheck source=build-scripts/libbuild.sh
include libbuild.sh
# shellcheck source=build-scripts/libdefer.sh
include libdefer.sh
# shellcheck source=build-scripts/libopt.sh
include libopt.sh

function main() {
  local -A options
  libopt_parse options \
    stage:all preset:fast clobber:allow_if_matching_values build_no:0 generate_jenkins_init:no expose_ports:no -- "$@"

  local preset="${options["preset"]}"
  local stage="${options["stage"]}"
  local clobber="${options["clobber"]}"
  local build_no="${options["build_no"]}"
  local generate_jenkins_init="${options["generate_jenkins_init"]}"
  local expose_ports="${options["expose_ports"]}"

  libmain_init iossifovlab.sfari-frontpage sfari_frontpage
  libmain_init_build_env \
    clobber:"$clobber" preset:"$preset" build_no:"$build_no" generate_jenkins_init:"$generate_jenkins_init" expose_ports:"$expose_ports" \
    iossifovlab.iossifovlab-containers
  libmain_save_build_env_on_exit
  libbuild_init stage:"$stage" registry.seqpipe.org

  defer_ret build_run_ctx_reset_all_persistent
  defer_ret build_run_ctx_reset

  local node_base_image_ref
  node_base_image_ref="$(e docker_img_iossifovlab_node_base)"
  build_run_ctx_init "container" "$node_base_image_ref"
  defer_ret build_run_ctx_reset

  build_stage "Clean and fetch fresh dependencies"
  {
    build_run rm -rf dist
    build_run rm -rf node_modules package-lock.json
    build_run npm install
  }

  build_stage "Compile production"
  {
    build_run rm -rf dist/
    build_run npm run-script ng build -- --aot --configuration 'production' --base-href ''
  }

  build_stage "Package production"
  {
    local image_name="sfari-frontpage-package"
    build_docker_data_image_create_from_tarball "${image_name}" <(
        build_run_local tar cvf - -C dist sfari-frontpage/
    )
  }
}

main "$@"
