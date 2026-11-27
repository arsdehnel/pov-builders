module "repo" {
  source = "github.com/arsdehnel/automation//open-tofu/modules/github-repo?ref=main"

  repo_name        = var.repo_name
  repo_description = "POV Builders"
  is_product       = false
  required_checks = [
    "lint-code / lint-code",
    "lint-commits / lint-commits",
    "run-tests / run-tests",
    "plan-github-setup / plan-open-tofu",
    "create-release-dry-run / create-release-dry-run",
  ]
}
