import asyncio
from unittest.mock import patch

import aiodocker

from eda_server import ruleset
from eda_server.config.enums import DeploymentTypeEnum

activation_id = 1
large_data_id = 1
execution_environment = "fedora:36"
rulesets = ""
ruleset_sources = []
inventory = ""
extravars = ""
working_directory = "/tmp"
host = "test-eda-server"
port = 15000


class TestDockerContainer(aiodocker.docker.DockerContainer):
    pass


class TestProc(asyncio.subprocess.Process):
    pass


def test_resolve_activation_function():
    expected = "create_docker_websocket_activation"
    src = {}
    f = ruleset.resolve_activation_function(src)
    assert f.__name__ == expected
    for _type in ("websocket", "eek", None):
        src["type"] = _type
        f = ruleset.resolve_activation_function(src)
        assert f.__name__ == expected


@patch("eda_server.ruleset.create_async_task")
@patch("eda_server.create_local_activation", return_value=TestProc())
async def test_activate_rulesets_local(local_activate, async_task):
    ruleset.activate_rulesets(
        DeploymentTypeEnum.LOCAL,
        activation_id,
        large_data_id,
        execution_environment,
        rulesets,
        ruleset_sources,
        inventory,
        extravars,
        working_directory,
        host,
        port,
        lambda: None,
    )
    assert activation_id in ruleset.activated_rulesets
    assert isinstance(ruleset.activated_rulesets[activation_id], TestProc)
    assert local_activate.called()
    assert async_task.called()
    del ruleset.activated_rulesets[activation_id]


@patch("eda_server.ruleset.create_async_task")
@patch(
    "eda_server.create_fallback_docker_activation",
    return_value=TestDockerContainer(),
)
async def test_activate_rulesets_docker_fallback(docker_activate, async_task):
    ruleset.activate_rulesets(
        DeploymentTypeEnum.DOCKER,
        activation_id,
        large_data_id,
        execution_environment,
        rulesets,
        ruleset_sources,
        inventory,
        extravars,
        working_directory,
        host,
        port,
        lambda: None,
    )
    assert activation_id in ruleset.activated_rulesets
    assert isinstance(
        ruleset.activated_rulesets[activation_id], TestDockerContainer
    )
    assert docker_activate.called()
    assert async_task.called()
    del ruleset.activated_rulesets[activation_id]


@patch("eda_server.ruleset.create_async_task")
@patch(
    "eda_server.create_docker_websocket_activation",
    return_value=TestDockerContainer(),
)
async def test_activate_rulesets_docker_websocket(docker_activate, async_task):
    ruleset.activate_rulesets(
        DeploymentTypeEnum.DOCKER,
        activation_id,
        large_data_id,
        execution_environment,
        rulesets,
        [{"type": "websocket", "config": {"port": 10000}}],
        inventory,
        extravars,
        working_directory,
        host,
        port,
        lambda: None,
    )
    assert activation_id in ruleset.activated_rulesets
    assert isinstance(
        ruleset.activated_rulesets[activation_id], TestDockerContainer
    )
    assert docker_activate.called()
    assert async_task.called()
    del ruleset.activated_rulesets[activation_id]
